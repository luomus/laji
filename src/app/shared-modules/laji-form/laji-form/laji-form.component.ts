import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy, OnInit,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import { FormApiClient } from '../../../shared/api/FormApiClient';
import { UserService } from '../../../shared/service/user.service';
import { Logger } from '../../../shared/logger/logger.service';
import LajiForm from 'laji-form/lib/laji-form';
import { ToastsService } from '../../../shared/service/toasts.service';
import { concatMap, map } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { Global } from '../../../../environments/global';
import { AreaService } from '../../../shared/service/area.service';

const GLOBAL_SETTINGS = '_global_form_settings_';

@Component({
  selector: 'laji-form',
  templateUrl: './laji-form.component.html',
  providers: [FormApiClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent implements OnDestroy, OnChanges, AfterViewInit, OnInit {
  @Input() lang: string;
  @Input() formData: any = {};
  @Input() tick: number;
  @Input() settingsKey = '';

  @Output() onSubmit = new EventEmitter();
  @Output() onChange = new EventEmitter();

  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;
  private _block = false;
  private settings: any;
  private errorSub: Subscription;
  private municipalityEnums: any;

  @ViewChild('errorModal') public errorModal: ModalDirective;
  @ViewChild('lajiForm') lajiFormRoot: ElementRef;

  constructor(private apiClient: FormApiClient,
              private userService: UserService,
              private logger: Logger,
              private ngZone: NgZone,
              private cd: ChangeDetectorRef,
              private toastsService: ToastsService,
              private areaService: AreaService
  ) {
  }

  ngOnInit(): void {
    this.areaService.getMunicipalities(this.lang).subscribe(municipalities => {
      this.municipalityEnums = municipalities.reduce((enums, municipality) => {
        enums.enum.push(municipality.id);
        enums.enumNames.push(municipality.value);
        return enums;
      }, {
        enums: [],
        enumNames: []
      });
      this.mountLajiForm();
    });
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unMount();
    this.reactElem = undefined;
    this.renderElem = undefined;
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.lajiFormWrapper) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      if (changes['lang']) {
        this.lajiFormWrapper.setState({lang: this.lang});
      }
      if (changes['formData']) {
        this.lajiFormWrapper.setState({
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          formData: this.formData.formData,
          validators: this.formData.validators,
          warnings: this.formData.warnings
        });
      }
    });
  }

  block() {
    if (!this._block) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.pushBlockingLoader();
      });
      this._block = true;
    }
  }

  unBlock() {
    if (this._block) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.popBlockingLoader();
      });
      this._block = false;
    }
  }

  submit() {
    if (this.lajiFormWrapper) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.submit();
      });
    }
  }

  mount() {
    if (!this.formData || !this.formData.formData || !this.lang) {
      return;
    }
    this.userService.getUserSetting(this.settingsKey).pipe(
      concatMap(globalSettings => this.userService.getUserSetting(GLOBAL_SETTINGS).pipe(
        map(settings => ({...globalSettings, ...settings}))
      ))
    ).subscribe(settings => {
      this.settings = settings;
      this.mountLajiForm();
    });
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
    this.errorSub = this.ngZone.onError.subscribe(() => {
      this.errorModal.show();
    });
  }

  mountLajiForm() {
    if (!this.municipalityEnums || !this.settings)  {
      return;
    }
    this.createNewLajiForm();
  }

  createNewLajiForm() {
    try {
      this.ngZone.runOutsideAngular(() => {
        if (this.lajiFormWrapper) {
          this.unMount();
        }

        const uiSchemaContext = this.formData.uiSchemaContext || {};
        uiSchemaContext['creator'] = this.formData.formData.creator;
        uiSchemaContext['municipalityEnum'] = this.municipalityEnums;
        this.apiClient.lang = this.lang;
        this.apiClient.personToken = this.userService.getToken();
        this.lajiFormWrapper = new LajiForm({
          staticImgPath: '/static/lajiForm/',
          rootElem: this.lajiFormRoot.nativeElement,
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          uiSchemaContext: uiSchemaContext,
          formData: this.formData.formData,
          validators: this.formData.validators,
          warnings: this.formData.warnings,
          onSubmit: this._onSubmit.bind(this),
          onChange: this._onChange.bind(this),
          onSettingsChange: this._onSettingsChange.bind(this),
          settings: this.settings,
          apiClient: this.apiClient,
          lang: this.lang,
          renderSubmit: false,
          topOffset: 50,
          bottomOffset: 50,
          googleApiKey: Global.googleApiKey,
          notifier: {
            success: msg => this.toastsService.showSuccess(msg),
            info: msg => this.toastsService.showInfo(msg),
            warning: msg => this.toastsService.showWarning(msg),
            error: msg => this.toastsService.showError(msg),
          }
        });
      });
    } catch (err) {
      this.logger.error('Failed to load lajiForm', {error: err, userSetting: this.settings});
    }
  }

  _onSettingsChange(settings: object, global = false) {
    this.userService.setUserSetting(global ? GLOBAL_SETTINGS : this.settingsKey, settings);
  }

  _onChange(formData) {
    this.onChange.emit(formData);
  }

  _onSubmit(data) {
    this.ngZone.run(() => {
      this.onSubmit.emit({
        data: data,
        makeBlock: this.lajiFormWrapper.pushBlockingLoader,
        clearBlock: this.lajiFormWrapper.popBlockingLoader
      });
    });
  }

  unMount() {
    try {
      if (this.lajiFormWrapper) {
        this.ngZone.runOutsideAngular(() => {
          this.lajiFormWrapper.unmount();
        });
      }
    } catch (err) {
      this.logger.warn('Unmounting failed', err);
    }
  }

  reload() {
    this.createNewLajiForm();
    this.errorModal.hide();
  }
}

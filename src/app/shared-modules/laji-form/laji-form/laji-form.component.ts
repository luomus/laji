import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges, ViewChild
} from '@angular/core';
import { FormApiClient } from '../../../shared/api/FormApiClient';
import { IUserSettings, UserService } from '../../../shared/service/user.service';
import { Logger } from '../../../shared/logger/logger.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { concatMap, map, take } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap';
import { Global } from '../../../../environments/global';
import { TranslateService } from '@ngx-translate/core';

const GLOBAL_SETTINGS = '_global_form_settings_';

@Component({
  selector: 'laji-form',
  templateUrl: './laji-form.component.html',
  providers: [FormApiClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() formData: any = {};
  @Input() settingsKey: keyof IUserSettings = 'formDefault';
  @Input() showShortcutButton = true;

  @Output() dataSubmit = new EventEmitter();
  @Output() dataChange = new EventEmitter();

  private lajiFormWrapper: any;
  private lajiFormWrapperProto: any;
  private _block = false;
  private settings: any;

  @ViewChild('errorModal', { static: true }) public errorModal: ModalDirective;
  @ViewChild('lajiForm', { static: true }) lajiFormRoot: ElementRef;

  constructor(private apiClient: FormApiClient,
              private userService: UserService,
              private logger: Logger,
              private ngZone: NgZone,
              private cd: ChangeDetectorRef,
              private toastsService: ToastsService,
              private translate: TranslateService
  ) {
    this._onError = this._onError.bind(this);
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unMount();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.lajiFormWrapper) {
      return;
    }
    if (changes['formData']) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.setState({
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          formData: this.formData.formData,
          validators: this.formData.validators,
          warnings: this.formData.warnings
        });
      });
    }
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

  reload() {
    this.createNewLajiForm();
    this.errorModal.hide();
  }

  submit() {
    if (this.lajiFormWrapper) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.submit();
      });
    }
  }

  private mount() {
    if (!this.formData || !this.formData.formData) {
      return;
    }
    import('laji-form/lib/laji-form').then((formPackage) => {
      this.lajiFormWrapperProto = formPackage.default;
      this.userService.getUserSetting(this.settingsKey).pipe(
        concatMap(globalSettings => this.userService.getUserSetting(GLOBAL_SETTINGS).pipe(
          map(settings => ({...globalSettings, ...settings}))
        )),
        take(1)
      ).subscribe(settings => {
        this.settings = settings;
        this.mountLajiForm();
      });
    });
  }

  private mountLajiForm() {
    if (!this.settings) {
      return;
    }
    this.createNewLajiForm(() => {
      if (this.lajiFormWrapper) {
        this.lajiFormWrapper.invalidateSize();
      }
    });
  }

  private createNewLajiForm(onReady?: () => void) {
    if (!this.lajiFormWrapperProto) {
      return;
    }
    try {
      this.ngZone.runOutsideAngular(() => {
        if (this.lajiFormWrapper) {
          this.unMount();
        }

        this.apiClient.lang = this.translate.currentLang;
        this.apiClient.personToken = this.userService.getToken();
        this.apiClient.formID = this.formData.id;
        this.lajiFormWrapper = new this.lajiFormWrapperProto({
          staticImgPath: '/static/lajiForm/',
          rootElem: this.lajiFormRoot.nativeElement,
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          uiSchemaContext: this.formData.uiSchemaContext,
          formData: this.formData.formData,
          validators: this.formData.validators,
          warnings: this.formData.warnings,
          onSubmit: this._onSubmit.bind(this),
          onChange: this._onChange.bind(this),
          onSettingsChange: this._onSettingsChange.bind(this),
          settings: this.settings,
          apiClient: this.apiClient,
          lang: this.translate.currentLang,
          renderSubmit: false,
          topOffset: 50,
          bottomOffset: 50,
          googleApiKey: Global.googleApiKey,
          notifier: {
            success: msg => this.toastsService.showSuccess(msg),
            info: msg => this.toastsService.showInfo(msg),
            warning: msg => this.toastsService.showWarning(msg),
            error: msg => this.toastsService.showError(msg),
          },
          showShortcutButton: this.showShortcutButton,
          onError: this._onError,
          onComponentDidMount: onReady ? onReady() : () => {}
        });
      });
    } catch (err) {
      this.logger.error('Failed to load LajiForm', {error: err, userSetting: this.settings});
    }
  }

  private _onSettingsChange(settings: object, global = false) {
    this.userService.setUserSetting(global ? GLOBAL_SETTINGS : this.settingsKey, settings);
  }

  private _onChange(formData) {
    this.dataChange.emit(formData);
  }

  private _onSubmit(data) {
    this.ngZone.run(() => {
      this.dataSubmit.emit({
        data: data,
        makeBlock: this.lajiFormWrapper.pushBlockingLoader,
        clearBlock: this.lajiFormWrapper.popBlockingLoader
      });
    });
  }

  private _onError(error, info) {
    this.logger.error('LajiForm crashed', {error, reactInfo: info, userSettings: this.settings});
    this.errorModal.show();
  }

  private unMount() {
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
}

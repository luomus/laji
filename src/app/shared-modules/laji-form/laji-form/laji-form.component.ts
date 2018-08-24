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
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormApiClient } from '../../../shared/api/FormApiClient';
import { UserService } from '../../../shared/service/user.service';
import { Logger } from '../../../shared/logger/logger.service';
import { environment } from '../../../../environments/environment';
import LajiForm from 'laji-form/lib/laji-form';
import { ToastsService } from '../../../shared/service/toasts.service';
import { concatMap, map } from 'rxjs/operators';

const GLOBAL_SETTINGS = '_global_form_settings_';

@Component({
  selector: 'laji-form',
  template: '<div></div>',
  providers: [FormApiClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent implements OnDestroy, OnChanges, AfterViewInit {

  @Input() lang: string;
  @Input() formData: any = {};
  @Input() tick: number;
  @Input() settingsKey = '';

  @Output() onSubmit = new EventEmitter();
  @Output() onChange = new EventEmitter();

  elem: ElementRef;
  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;
  private _block = false;

  constructor(@Inject(ElementRef) elementRef: ElementRef,
              private apiClient: FormApiClient,
              private userService: UserService,
              private logger: Logger,
              private ngZone: NgZone,
              private cd: ChangeDetectorRef,
              private toastsService: ToastsService,
  ) {
    this.elem = elementRef.nativeElement;
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unMount();
    this.reactElem = undefined;
    this.renderElem = undefined;
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
    )
      .subscribe(settings => {
        try {
          this.ngZone.runOutsideAngular(() => {
            const uiSchemaContext = this.formData.uiSchemaContext || {};
            uiSchemaContext['creator'] = this.formData.formData.creator;
            this.apiClient.lang = this.lang;
            this.apiClient.personToken = this.userService.getToken();
            this.lajiFormWrapper = new LajiForm({
              staticImgPath: '/static/lajiForm/',
              rootElem: this.elem,
              schema: this.formData.schema,
              uiSchema: this.formData.uiSchema,
              uiSchemaContext: uiSchemaContext,
              formData: this.formData.formData,
              validators: this.formData.validators,
              warnings: this.formData.warnings,
              onSubmit: this._onSubmit.bind(this),
              onChange: this._onChange.bind(this),
              onSettingsChange: this._onSettingsChange.bind(this),
              settings: settings,
              apiClient: this.apiClient,
              lang: this.lang,
              renderSubmit: false,
              topOffset: 50,
              bottomOffset: 50,
              googleApiKey: environment.googleApiKey,
              notifier: {
                success: msg => this.toastsService.showSuccess(msg),
                info: msg => this.toastsService.showInfo(msg),
                warning: msg => this.toastsService.showWarning(msg),
                error: msg => this.toastsService.showError(msg),
              }
            });
          });
        } catch (err) {
          this.logger.error('Failed to load lajiForm', {error: err, userSetting: settings});
        }
      });
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
}

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
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormApiClient } from '../../../shared/api/FormApiClient';
import { IUserSettings, UserService } from '../../../shared/service/user.service';
import { Logger } from '../../../shared/logger/logger.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { concatMap, map, take } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Global } from '../../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { Profile } from '../../../shared/model/Profile';
import LajiForm from 'laji-form/lib/index';
import { Theme as LajiFormTheme } from 'laji-form/lib/themes/theme';

const GLOBAL_SETTINGS = '_global_form_settings_';

interface ErrorModal {
  description: string;
  buttons: {
    label: string;
    fn: () => void;
  }[];
}

@Component({
  selector: 'laji-form',
  templateUrl: './laji-form.component.html',
  styleUrls: ['./laji-form.component.scss'],
  providers: [FormApiClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormComponent implements OnDestroy, OnChanges, AfterViewInit {

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

  static TOP_OFFSET = 50;
  static BOTTOM_OFFSET = 53.5;
  @Input() formData: any = {};
  @Input() settingsKey: keyof IUserSettings = 'formDefault';
  @Input() showShortcutButton = true;

  @Output() dataSubmit = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() validationError = new EventEmitter();
  @Output() goBack = new EventEmitter();

  errorModalData: ErrorModal;

  reactCrashModalData: ErrorModal = {
    description: 'haseka.form.crash.description',
    buttons: [
      {label: 'haseka.form.crash.reload', fn: () => this.reload()},
      {label: 'haseka.form.crash.leave', fn: () => this.leave()}
    ]
  };

  saveErrorModalData: ErrorModal = {
    description: 'haseka.form.saveError.description',
    buttons: [
      {label: 'Ok', fn: () => this.dismissErrorModal()},
      {label: 'haseka.form.crash.leave', fn: () => this.leave()}
    ]
  };

  private lajiFormWrapper: LajiForm;
  private lajiFormWrapperProto: any;
  private lajiFormBs3Theme: LajiFormTheme;
  private _block = false;
  private settings: any;
  private _formData: any;
  private defaultMediaMetadata: Profile['settings']['defaultMediaMetadata'];

  @ViewChild('errorModal', { static: true }) public errorModal: ModalDirective;
  @ViewChild('lajiForm', { static: true }) lajiFormRoot: ElementRef;

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

  leave() {
    this.goBack.emit();
  }

  submit() {
    if (this.lajiFormWrapper) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.submit();
      });
    }
  }

  submitOnlySchemaValidations() {
    if (this.lajiFormWrapper) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.submitOnlySchemaValidations();
      });
    }
  }

  popErrorListIfNeeded() {
    this.lajiFormWrapper.lajiForm.popErrorListIfNeeded();
  }

  displayErrorModal(type: 'saveError' | 'reactCrash') {
    this.errorModalData = type === 'reactCrash'
      ? this.reactCrashModalData
      : this.saveErrorModalData;
    this.cd.markForCheck();
    this.errorModal.show();
  }

  dismissErrorModal() {
    this.errorModal.hide();
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
          theme: this.lajiFormBs3Theme,
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          uiSchemaContext: this.formData.uiSchemaContext,
          formData: this.formData.formData,
          validators: this.formData.validators,
          warnings: this.formData.warnings,
          onSubmit: this._onSubmit.bind(this),
          onChange: this._onChange.bind(this),
          onSettingsChange: this._onSettingsChange.bind(this),
          onValidationError: this._onValidationError.bind(this),
          settings: this.settings,
          mediaMetadata: this.defaultMediaMetadata,
          apiClient: this.apiClient,
          lang: this.translate.currentLang,
          renderSubmit: false,
          topOffset: LajiFormComponent.TOP_OFFSET,
          bottomOffset: LajiFormComponent.BOTTOM_OFFSET,
          googleApiKey: Global.googleApiKey,
          notifier: {
            success: msg => this.toastsService.showSuccess(msg),
            info: msg => this.toastsService.showInfo(msg),
            warning: msg => this.toastsService.showWarning(msg),
            error: msg => this.toastsService.showError(msg),
          },
          showShortcutButton: this.showShortcutButton,
          onError: this._onError,
          onComponentDidMount: onReady ? onReady() : () => {},
          optimizeOnChange: true
        });
      });
    } catch (err) {
      this.logger.error('Failed to load LajiForm', {error: err, userSetting: this.settings});
    }
  }

  private mount() {
    if (!this.formData?.formData) {
      return;
    }
    combineLatest(
      import('laji-form'),
      import('laji-form/lib/themes/bs3'),
      this.userService.getUserSetting<any>(this.settingsKey).pipe(
        concatMap(settings => this.userService.getUserSetting<any>(GLOBAL_SETTINGS).pipe(
          map(globalSettings => ({...globalSettings, ...settings}))
        )),
        take(1)
      ),
      this.userService.getProfile().pipe(map(profile => profile.settings?.defaultMediaMetadata))
    ).subscribe(([formPackage, formBs3ThemePackage, settings, defaultMediaMetadata]) => {
      this.lajiFormWrapperProto = formPackage.default;
      this.lajiFormBs3Theme = formBs3ThemePackage.default;
      this.defaultMediaMetadata = defaultMediaMetadata;
      this.settings = settings;
      this.mountLajiForm();
    });
  }

  private _onSettingsChange(settings: any, global = false) {
    this.ngZone.run(() => {
      this.userService.setUserSetting(global ? GLOBAL_SETTINGS : this.settingsKey, settings);
    });
  }

  private _onChange(formData) {
    this._formData = formData;
    this.ngZone.run(() => {
      this.dataChange.emit(formData);
    });
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
    this.logger.error('LajiForm crashed', {error, userSettings: this.settings, document: this.formData?.formData});
    console.error(info);
    this.displayErrorModal('reactCrash');
  }

  private _onValidationError(errors) {
    this.ngZone.run(() => {
      this.validationError.emit(errors);
    });
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

  // TODO REMOVE BEFORE MAKING PR
  triggerError() {
    this._onError('TEST', 'TEST INFO');
  }
  // TODO REMOVE BEFORE MAKING PR
  triggerAngularError() {
    this._onSubmit({formData: {...this._formData, invalidPropForTesting: true}});
  }
}

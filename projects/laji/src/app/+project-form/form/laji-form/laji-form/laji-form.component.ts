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
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormApiClient } from '../../../../shared/api/FormApiClient';
import { UserSettings, UserService } from '../../../../shared/service/user.service';
import { Logger } from '../../../../shared/logger/logger.service';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { concatMap, map, take } from 'rxjs/operators';
import { Global } from '../../../../../environments/global';
import { combineLatest, Subscription } from 'rxjs';
import { Profile } from '../../../../shared/model/Profile';
import type LajiForm from '@luomus/laji-form/lib/index';
import type { Theme as LajiFormTheme } from '@luomus/laji-form/lib/themes/theme';
import { Form } from 'projects/laji/src/app/shared/model/Form';
import { environment } from 'projects/laji/src/environments/environment';
import { ProjectFormService } from 'projects/laji/src/app/shared/service/project-form.service';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

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
export class LajiFormComponent implements OnDestroy, OnChanges, AfterViewInit, OnInit {

  constructor(private apiClient: FormApiClient,
              private userService: UserService,
              private logger: Logger,
              private ngZone: NgZone,
              private cd: ChangeDetectorRef,
              private toastsService: ToastsService,
              private projectFormService: ProjectFormService,
              private platformService: PlatformService
  ) {
    this._onError = this._onError.bind(this);
  }

  static TOP_OFFSET = 50;
  static BOTTOM_OFFSET = 53.5;
  @Input() form: Form.SchemaForm;
  @Input() formData: any = {};
  @Input() settingsKey: keyof UserSettings = 'formDefault';
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
  private defaultMediaMetadata: Profile['settings']['defaultMediaMetadata'];
  private langSub: Subscription;
  private localLang: string;
  private reloadSub: Subscription;


  @ViewChild('errorModal', { static: true }) public errorModal: ModalComponent;
  @ViewChild('lajiForm', { static: true }) lajiFormRoot: ElementRef;

  ngOnInit() {
    this.langSub = this.projectFormService.localLang$.subscribe(lang => {
      this.localLang = lang;
      this.updateLajiFormLocalLang();
    });

    this.reloadSub = this.projectFormService.remountLajiForm$.subscribe(() => this.reload());
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unMount();
    this.langSub.unsubscribe();
    this.reloadSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.lajiFormWrapper) {
      return;
    }
    if (changes['form']) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.setState({
          schema: this.form.schema,
          uiSchema: this.form.uiSchema,
          formData: this.formData,
          validators: this.form.validators,
          warnings: this.form.warnings
        });
      });
    }
  }

  block() {
    if (this._block) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper.pushBlockingLoader();
    });
    this._block = true;
  }

  unBlock() {
    if (!this._block) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper.popBlockingLoader();
    });
    this._block = false;
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
    if (!this.lajiFormWrapper) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper.submitOnlySchemaValidations();
    });
  }

  popErrorListIfNeeded() {
    if (!this.lajiFormWrapper) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper.lajiForm.popErrorListIfNeeded();
    });
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
    this.createNewLajiForm();
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
        this.apiClient.lang = this.localLang;
        this.apiClient.personToken = this.userService.getToken();
        this.apiClient.formID = this.form.id;
        this.lajiFormWrapper = new this.lajiFormWrapperProto({
          rootElem: this.lajiFormRoot.nativeElement,
          theme: this.lajiFormBs3Theme,
          schema: this.form.schema,
          uiSchema: this.form.uiSchema,
          uiSchemaContext: this.form.uiSchemaContext,
          formData: this.formData,
          validators: this.form.validators,
          warnings: this.form.warnings,
          onSubmit: this._onSubmit.bind(this),
          onChange: this._onChange.bind(this),
          onSettingsChange: this._onSettingsChange.bind(this),
          onValidationError: this._onValidationError.bind(this),
          settings: this.settings,
          mediaMetadata: this.defaultMediaMetadata,
          apiClient: this.apiClient,
          lang: this.localLang,
          renderSubmit: false,
          topOffset: LajiFormComponent.TOP_OFFSET,
          bottomOffset: LajiFormComponent.BOTTOM_OFFSET,
          googleApiKey: Global.googleApiKey,
          notifier: this.notifier,
          showShortcutButton: this.showShortcutButton,
          onError: this._onError,
          onComponentDidMount: onReady ? onReady() : () => {},
          optimizeOnChange: true,
          lajiGeoServerAddress: (environment as any).geoserver
        });
      });
    } catch (err) {
      this.logger.error('Failed to load LajiForm', {error: err, userSetting: this.settings});
    }
  }

  private mount() {
    if (!this.form || !this.formData || !this.platformService.isBrowser) {
      return;
    }
    combineLatest(
      import('@luomus/laji-form'),
      import('@luomus/laji-form/lib/themes/bs3'),
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
    this.ngZone.run(() => {
      this.dataChange.emit(formData);
    });
  }

  private _onSubmit(data) {
    this.ngZone.run(() => {
      this.dataSubmit.emit({
        data,
        makeBlock: this.lajiFormWrapper.pushBlockingLoader,
        clearBlock: this.lajiFormWrapper.popBlockingLoader
      });
    });
  }

  private _onError(error, info) {
    this.logger.error('LajiForm crashed', {error, userSettings: this.settings, document: this.formData});
    console.error(info);
    this.displayErrorModal('reactCrash');
  }

  private _onValidationError(errors) {
    this.ngZone.run(() => {
      this.validationError.emit(errors);
    });
  }

  private unMount() {
    if (!this.lajiFormWrapper) {
      return;
    }
    try {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper.unmount();
      });
    } catch (err) {
      this.logger.warn('Unmounting failed', err);
    }
  }

  private notifier = {
    success: msg => this.ngZone.run(() => this.toastsService.showSuccess(msg)),
    info: msg => this.ngZone.run(() => this.toastsService.showInfo(msg)),
    warning: msg => this.ngZone.run(() => this.toastsService.showWarning(msg)),
    error: msg => this.ngZone.run(() => this.toastsService.showError(msg)),
  };

  private updateLajiFormLocalLang() {
    if (!this.lajiFormWrapper) {
      return;
    }
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper.setState({lang: this.localLang as any});
      this.apiClient.lang = this.localLang;
    });
  }
}

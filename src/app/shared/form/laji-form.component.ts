import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
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
import { FormApiClient } from '../api';
import { UserService } from '../service/user.service';
import { Logger } from '../logger/logger.service';
import { LajiExternalService } from '../service/laji-external.service';

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
  private dataKey: string;

  constructor(@Inject(ElementRef) elementRef: ElementRef,
              private apiClient: FormApiClient,
              private userService: UserService,
              private lajiExternalService: LajiExternalService,
              private logger: Logger,
              private ngZone: NgZone,
              private cd: ChangeDetectorRef
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
    console.log('NG ON CHANGES');
    this.ngZone.runOutsideAngular(() => {
      if (changes['lang']) {
        this.lajiFormWrapper.setState({lang: this.lang});
      }
      if (changes['formData']) {
        console.log('FORMDATA CHANGED! SETTING STATE!!!', JSON.stringify(this.formData.formData));
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
    console.log('MOUNTING');
    this.userService.getUserSetting(this.settingsKey)
      .subscribe(settings => {
        try {
          console.log('USERS SETTINGS', settings);
          this.ngZone.runOutsideAngular(() => {
            const uiSchemaContext = this.formData.uiSchemaContext || {};
            uiSchemaContext['creator'] = this.formData.formData.creator;
            this.apiClient.lang = this.lang;
            this.apiClient.personToken = this.userService.getToken();
            this.lajiFormWrapper = this.lajiExternalService.getForm({
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
              bottomOffset: 50
            });
          });
        } catch (err) {
          this.logger.error('Failed to load lajiForm', err);
        }
      });
  }

  _onSettingsChange(settings: object) {
    this.userService.setUserSetting(this.settingsKey, settings);
  }

  _onChange(formData) {
    const cachkey = JSON.stringify(formData);
    if (this.dataKey === cachkey) {
      console.log('SAME DATA NOT SENDING!!!', JSON.stringify(formData));
      return;
    }
    this.dataKey = cachkey;
    console.log('FORM ON CHANGE', JSON.stringify(formData));
    this.onChange.emit(formData);
  }

  _onSubmit(data) {
    console.log('FORM ON SUBMIT');
    this.ngZone.run(() => {
      this.onSubmit.emit({
        data: data,
        makeBlock: this.lajiFormWrapper.pushBlockingLoader,
        clearBlock: this.lajiFormWrapper.popBlockingLoader
      });
    });
  }

  unMount() {
    console.log('UNMOUNTING');
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

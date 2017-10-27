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
  }

  block() {
    if (!this._block) {
      this.lajiFormWrapper.pushBlockingLoader();
      this._block = true;
    }
  }

  unBlock() {
    if (this._block) {
      this.lajiFormWrapper.popBlockingLoader();
      this._block = false;
    }
  }

  submit() {
    if (this.lajiFormWrapper) {
      this.lajiFormWrapper.submit();
    }
  }

  mount() {
    if (!this.formData || !this.formData.formData || !this.lang) {
      return;
    }
    this.userService.getUserSetting(this.settingsKey)
      .subscribe(settings => {
        try {
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
    this.onChange.emit(formData);
    this.ngZone.run(() => {});
  }

  _onSubmit(data) {
    this.onSubmit.emit({
      data: data,
      makeBlock: this.lajiFormWrapper.pushBlockingLoader,
      clearBlock: this.lajiFormWrapper.popBlockingLoader
    });
    this.ngZone.run(() => {});
  }

  unMount() {
    try {
      this.lajiFormWrapper.unmount();
    } catch (err) {
      this.logger.warn('Unmounting failed', err);
    }
  }
}

import {
  Component, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges,
  AfterViewInit
} from '@angular/core';
import { FormApiClient } from '../api';
import { UserService } from '../service/user.service';
import { Logger } from '../logger/logger.service';

import LajiFormWrapper from 'laji-form';

// const lajiFormWrapper = require('laji-form/dist/laji-form').default;

@Component({
  selector: 'laji-form',
  template: '',
  providers: [FormApiClient]
})
export class LajiFormComponent implements OnDestroy, OnChanges, AfterViewInit {

  @Input() formId: string;
  @Input() lang: string;
  @Input() formData: any = {};
  @Input() tick: number;

  @Output() onSubmit = new EventEmitter();
  @Output() onChange = new EventEmitter();

  elem: ElementRef;
  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;

  constructor(@Inject(ElementRef) elementRef: ElementRef,
              private apiClient: FormApiClient,
              private userService: UserService,
              private logger: Logger
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

  ngOnChanges() {
    if (!this.lajiFormWrapper) {
      return;
    }
    this.unMount();
    this.mount();
  }

  clearState() {
    if (this.lajiFormWrapper) {
      this.lajiFormWrapper.clearState();
    }
  }

  submit() {
    if (this.lajiFormWrapper) {
      this.lajiFormWrapper.submit();
    }
  }

  mount() {
    if (!this.formData || !this.lang) {
      return;
    }
    try {
      this.apiClient.lang = this.lang;
      this.apiClient.personToken = this.userService.getToken();
      this.lajiFormWrapper = new LajiFormWrapper({
        staticImgPath: '/static/lajiForm/',
        rootElem: this.elem,
        schema: this.formData.schema,
        uiSchema: this.formData.uiSchema,
        uiSchemaContext: this.formData.uiSchemaContext,
        formData: this.formData.formData,
        validators: this.formData.validators,
        onSubmit: this._onSubmit.bind(this),
        onChange: this._onChange.bind(this),
        apiClient: this.apiClient,
        lang: this.lang,
        renderSubmit: false
      });
    } catch (err) {
      this.logger.error('Failed to load lajiForm', err);
    }
  }

  _onChange(formData) {
    this.onChange.emit(formData);
  }

  _onSubmit(data) {
    this.onSubmit.emit({
      data: data,
      makeBlock: this.lajiFormWrapper.pushBlockingLoader,
      clearBlock: this.lajiFormWrapper.popBlockingLoader
    });
  }

  unMount() {
    try {
      this.lajiFormWrapper.unmount();
    } catch (err) {
      this.logger.warn('Unmounting failed', err);
    }
  }
}

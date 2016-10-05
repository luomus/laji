import {
  Component, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges
} from '@angular/core';
import { FormApiClient } from '../api';
import { UserService } from '../service/user.service';

const lajiFormWrapper = require('laji-form/dist/laji-form').default;

@Component({
  selector: 'laji-form',
  template: '',
  providers: [FormApiClient]
})
export class LajiFormComponent implements OnDestroy, OnChanges {

  @Input() formId: string;
  @Input() lang: string;
  @Input() formData: any = {};

  @Output() onSubmit = new EventEmitter ();
  @Output() onChange = new EventEmitter();

  elem: ElementRef;
  lajiFormWrapper: any;
  reactElem: any;
  renderElem: any;

  constructor(@Inject(ElementRef) elementRef: ElementRef,
              private apiClient: FormApiClient,
              private userService: UserService
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
    if (!this.renderElem) {
      return;
    }
    this.unMount();
    this.mount();
  }

  mount() {
    if (!this.formData || !this.lang) {
      return;
    }
    try {
      this.apiClient.lang = this.lang;
      this.apiClient.personToken = this.userService.getToken();
      this.lajiFormWrapper = new lajiFormWrapper({
        rootElem: this.elem,
        schema: this.formData.schema,
        uiSchema: this.formData.uiSchema,
        uiSchemaContext: this.formData.uiSchemaContext,
        formData: this.formData.formData,
        onSubmit: this._onSubmit.bind(this),
        apiClient: this.apiClient,
        lang: this.lang
      });
    } catch (err) {
      console.log(err);
    }
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
      console.log(err);
    }
  }
}

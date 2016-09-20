import {Component, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {FormApiClient, FormApi} from "../api";
import {UserService} from "../service/user.service";

let React = require('react');
let ReactDOM = require('react-dom');
let LajiForm = require('../../../../node_modules/laji-form/lib/components/LajiForm').default;

let schema = require('./schema.json');


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
  reactElem:any;
  renderElem:any;

  constructor(@Inject(ElementRef) elementRef: ElementRef,
              private apiClient: FormApiClient,
              private userService:UserService
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
    this.apiClient.lang = this.lang;
    this.apiClient.personToken = this.userService.getToken();
    try {
      this.reactElem = React.createElement(LajiForm,
        {
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          uiSchemaContext: this.formData.uiSchemaContext,
          formData: this.formData.formData,
          onChange: data => this.onChange.emit(data),
          onSubmit: this._onSubmit.bind(this),
          apiClient: this.apiClient,
          lang: this.lang
        }
      );
      this.renderElem = ReactDOM.render(
        this.reactElem,
        this.elem
      );
    } catch (err) {
      console.log(err);
    }
  }

  _onSubmit(data) {
    this.onSubmit.emit({
      data:data,
      makeBlock: LajiForm.pushBlockingLoader,
      clearBlock: LajiForm.popBlockingLoader
    })
  }

  unMount() {
    try {
      ReactDOM.unmountComponentAtNode(this.elem);
    } catch(err) {
      console.log(err);
    }
  }
}

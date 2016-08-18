import {Component, OnInit, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {FormApiClient, FormApi} from "../api";

//let styles = require('laji-form/lib/styles');
let React = require('react');
let ReactDOM = require('react-dom');
let LajiForm = require('laji-form').default;

let schema = require('./schema.json');

@Component({
  selector: 'laji-form',
  template: '',
  providers: [FormApiClient]
})
export class LajiFormComponent implements OnInit, OnDestroy {

  @Input() formId: string;
  @Input() lang: string;
  @Input() formData: any = {};

  @Output() onSubmit = new EventEmitter();

  elem: ElementRef;

  constructor(@Inject(ElementRef) elementRef: ElementRef,
              private apiClient: FormApiClient) {
    this.elem = elementRef.nativeElement;
  }

  ngOnInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unMount();
  }

  onChange() {
    this.unMount();
    this.mount();
    console.log('parameter changed!');
  }

  mount() {
    console.log(this.formData);
    if (!this.formData) {
      return;
    }
    ReactDOM.render(
      React.createElement(LajiForm,
        {
          schema: this.formData.schema,
          uiSchema: this.formData.uiSchema,
          uiSchemaContext: this.formData.uiSchemaContext,
          formData: this.formData.updateForm,
          onChange: this.onChange,
          onSubmit: data => this.onSubmit.emit(data),
          apiClient: this.apiClient,
          lang: this.lang
        }
      ),
      this.elem
    );
  }

  unMount() {
    ReactDOM.unmountComponentAtNode(this.elem);
  }
}

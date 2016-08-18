import {Component, OnInit, ElementRef, Inject, OnDestroy, Input, Output, EventEmitter, OnChanges} from '@angular/core';
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
export class LajiFormComponent implements OnInit, OnDestroy, OnChanges {

  @Input() formId: string;
  @Input() lang: string;
  @Input() formData: any = {};

  @Output() onSubmit = new EventEmitter();
  @Output() onChange = new EventEmitter();

  elem: ElementRef;
  reactElem:any;

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

  ngOnChanges() {
    if (!this.reactElem) {
      return;
    }
    //this.apiClient.lang = this.lang;
    //this.reactElem.props['lang'] = this.lang;
    //this.reactElem.props['schema'] = this.formData.schema;
    //this.reactElem.props['uiSchema'] = this.formData.uiSchema;
    //this.reactElem.props['uiSchemaContext'] = this.formData.uiSchemaContext;
    this.unMount();
    this.mount();
  }

  mount() {
    if (!this.formData || !this.lang) {
      return;
    }
    this.apiClient.lang = this.lang;
    this.reactElem = React.createElement(LajiForm,
      {
        schema: this.formData.schema,
        uiSchema: this.formData.uiSchema,
        uiSchemaContext: this.formData.uiSchemaContext,
        formData: this.formData.formData,
        onChange: data => this.onChange.emit(data),
        onSubmit: data => this.onSubmit.emit(data),
        apiClient: this.apiClient,
        lang: this.lang
      }
    );
    ReactDOM.render(
      this.reactElem,
      this.elem
    );
  }

  unMount() {
    ReactDOM.unmountComponentAtNode(this.elem);
    delete this.reactElem;
  }
}

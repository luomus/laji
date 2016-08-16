import {Component, OnInit, ElementRef, Inject, OnDestroy, Input} from '@angular/core';
import {FormApiClient} from "../api/FormApiClient";

let React = require('react');
let ReactDOM = require('react-dom');
let LajiForm = require('laji-form');

let schema = require('./schema.json');

@Component({
  selector: 'laji-form',
  template: '',
  providers: [ FormApiClient ]
})
export class LajiFormComponent implements OnInit, OnDestroy {

  @Input() formId:string;

  elem:ElementRef;

  constructor(@Inject(ElementRef) elementRef: ElementRef, private apiClient:FormApiClient) {
    this.elem = elementRef.nativeElement;
  }

  ngOnInit() {
    this.mount();
  }

  onChange(value) {
    console.log(value);
  }

  onSubmit(data) {
    console.log(data);
  }

  ngOnDestroy() {
    this.unMount();
  }

  mount() {
     ReactDOM.render(
       React.createElement(LajiForm.default,
       {
         schema: schema.schema,
         uiSchema: schema.uiSchema,
         uiSchemaContext: schema.uiSchemaContext,
         formData: {gatheringEvent: {leg: ['MA.97']}, editors: ['MA.97']},
         onChange: this.onChange,
         onSubmit: this.onSubmit,
         apiClient: this.apiClient,
         lang: 'fi'
       }
       ),
       this.elem
     );
  }

  unMount() {
    ReactDOM.unmountComponentAtNode(this.elem);
  }

}

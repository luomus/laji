import {Component, OnInit, ElementRef, Inject} from '@angular/core';

declare let LajiForm: any;
declare let React: any;
declare let ReactDOM: any;

let schema = require('./schema.json');

var Hello = React.createClass({
  displayName: 'Hello',
  render: function () {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

@Component({
  selector: 'laji-haseka-form',
  template: ''
})
export class HaSeKaFormComponent {
  constructor(@Inject(ElementRef) elementRef: ElementRef) {
    console.log(LajiForm);
    /*
    ReactDOM.render(
      React.createElement(LajiForm.default,
        {
          schema: schema.schema,
          uiSchema: schema.uiSchema,
          formData: {gatheringEvent: {leg: ['MA.97']}, editors: ['MA.97']},
          onChange: this.onChange,
          onSubmit: this.onSubmit,
          lang: 'fi'
        }),
      elementRef.nativeElement
    );
    */
    ReactDOM.render(
      React.createElement(Hello,
        {
          name: ' from react!'
        }
      ),
      elementRef.nativeElement
    );
  }

  onChange(value) {
    console.log(value);
  }

  onSubmit(data) {
    console.log(data);
  }

}

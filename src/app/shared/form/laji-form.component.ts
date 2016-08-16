import {Component, OnInit, ElementRef, Inject, OnDestroy} from '@angular/core';

declare let LajiForm: any;
declare let React: any;
declare let ReactDOM: any;

//let schema = require('./schema.json');

var Hello = React.createClass({
  tick:null,
  displayName: 'Hello',
  componentDidMount() {
    this.tick = setInterval(function() {
      console.log('Tick');
    }, 1000);
  },
  componentWillUnmount() {
    console.log('unMount');
    clearInterval(this.tick);
  },
  render: function () {
    return React.createElement("div", null, "Hello ", this.props.name);
  }
});

@Component({
  selector: 'laji-form',
  template: ''
})
export class LajiFormComponent implements OnDestroy {

  elem:ElementRef;

  constructor(@Inject(ElementRef) elementRef: ElementRef) {
    this.elem = elementRef.nativeElement;
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
     }
     ),
     this.elem
     );
     */
    ReactDOM.render(
      React.createElement(Hello,
        {
          name: ' from react!'
        }
      ),
      this.elem
    );
  }

  unMount() {
    ReactDOM.unmountComponentAtNode(this.elem);
  }

}

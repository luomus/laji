import {Component, OnInit, Input, forwardRef, Output, EventEmitter} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

export const OBSERVATION_MULTI_RADIO_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MultiRadioComponent),
  multi: true
};

@Component({
  selector: 'multi-radio',
  templateUrl: 'multi-radio.component.html',
  styleUrls: ['./multi-radio.component.css'],
  providers: [OBSERVATION_MULTI_RADIO_VALUE_ACCESSOR]
})
export class MultiRadioComponent implements ControlValueAccessor, OnInit {
  @Input() options:MultiRadioOption[];
  @Input() name:string;

  onChange = (_:any) => {};
  onTouched = () => {};

  private innerValue = undefined;

  ngOnInit() {
  }

  get value(): any {
    return this.innerValue;
  };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

export interface MultiRadioOption {
  value:any;
  label:string;
}

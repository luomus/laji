import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

export enum CheckboxType {
  basic,
  excluded,
  partial
}


@Component({
  selector: 'laji-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {

  @ViewChild('checkbox', { static: true }) checkbox: ElementRef<HTMLInputElement>;

  @Input() checkboxType = CheckboxType.basic;
  @Output() valueChange = new EventEmitter();

  _value: boolean;
  stateClass = 'clear';

  constructor() { }

  @Input()
  set value(value) {
    this._value = value;
    if (value === true) {
      this.checkbox.nativeElement.checked = true;
      this.stateClass = 'checked';
    } else if (value === false) {
      this.checkbox.nativeElement.indeterminate = true;
      switch (this.checkboxType) {
        case 0: {
           this.stateClass = 'clear';
           break;
        }
        case 1: {
          this.stateClass = 'excluded';
           break;
        }
        case 2: {
          this.stateClass = 'negative';
           break;
        }
        default: {
          this.stateClass = 'clear';
           break;
        }
     }
    } else {
      this.checkbox.nativeElement.checked = false;
      this.stateClass = 'clear';
    }
  }

  changeValue() {
    let valueEmitted;
    if (this.checkboxType === 2) {
      if (this._value === true) {
        valueEmitted = undefined;
      } else {
        valueEmitted = true;
      }
    } else if (this.checkboxType === 1) {
      if (this._value === true) {
        valueEmitted = false;
      } else if (this._value === false) {
        valueEmitted = undefined;
      } else {
        valueEmitted = true;
      }
    } else {
      if (this._value === true) {
        valueEmitted = false;
      } else {
        valueEmitted = true;
      }
    }
    this.valueChange.emit(valueEmitted);
  }

}

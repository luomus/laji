import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

export enum CheckboxType {
  basic = 'basic',
  excluded = 'excluded',
  partial = 'partial'
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

  @Input()
  set value(value) {
    this._value = value;
    if (value === true) {
      this.checkbox.nativeElement.checked = true;
      this.stateClass = 'checked';
    } else if (value === false) {
      this.checkbox.nativeElement.indeterminate = true;
      switch (this.checkboxType) {
        case CheckboxType.basic: {
           this.stateClass = 'clear';
           break;
        }
        case CheckboxType.excluded: {
          this.stateClass = 'excluded';
           break;
        }
        case CheckboxType.partial: {
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
    if (this.checkboxType === CheckboxType.partial) {
      if (this._value === true) {
        valueEmitted = undefined;
      } else {
        valueEmitted = true;
      }
    } else if (this.checkboxType === CheckboxType.excluded) {
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

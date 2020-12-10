import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'laji-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {

  @ViewChild('checkbox', { static: true }) checkbox: ElementRef<HTMLInputElement>;

  @Input() threeState = false;
  @Input() hasSubCategories = false;
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
    } else if (value === false && this.threeState) {
      this.checkbox.nativeElement.indeterminate = true;
      this.stateClass = this.hasSubCategories ? 'negative' : 'excluded';
    } else if (value === false && !this.threeState) {
      this.checkbox.nativeElement.indeterminate = true;
      this.stateClass = this.hasSubCategories ? 'negative' : 'excluded';
    } else {
      this.checkbox.nativeElement.checked = false;
      this.stateClass = 'clear';
    }
  }

  changeValue() {
    this.valueChange.emit(this._value === true ? false : (this._value === false ? (this.threeState ? undefined : true) : true));
  }

}

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'laji-indeterminate-checkbox',
  templateUrl: './indeterminate-checkbox.component.html',
  styleUrls: ['./indeterminate-checkbox.component.css']
})
export class IndeterminateCheckboxComponent {

  @ViewChild('checkbox') checkbox: ElementRef<HTMLInputElement>;

  @Output() valueChange = new EventEmitter();
  @Output() update = new EventEmitter();

  _value: boolean;

  constructor() { }

  @Input()
  set value(value) {
    this._value = value;
    if (value === true) {
      this.checkbox.nativeElement.checked = true;
    } else if (value === false) {
      this.checkbox.nativeElement.indeterminate = true;
    } else {
      this.checkbox.nativeElement.checked = false;
    }
  }

  changeValue() {
    this.valueChange.emit(this._value === true ? false : (this._value === false ? undefined : true));
    this.update.emit();
  }

}

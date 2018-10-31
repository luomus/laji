import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-wbc-table-filter',
  templateUrl: './wbc-table-filter.component.html',
  styleUrls: ['./wbc-table-filter.component.scss']
})
export class WbcTableFilterComponent {

  _value = '';
  @Output() onValueChange = new EventEmitter<string>();

  constructor() { }

  @Input()
  set value(val: string) {
    this._value = val || '';
  }


  update(event: KeyboardEvent) {
    this.onValueChange.emit((event.target as HTMLInputElement).value);
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField, IGNORE_VALUE } from '../../../model/form-field';

@Component({
  selector: 'laji-cell-value-select',
  templateUrl: './cell-value-select.component.html',
  styleUrls: ['./cell-value-select.component.css']
})
export class CellValueSelectComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: string} = {};
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  _field: FormField;
  labels: string[] = [];

  constructor() { }

  @Input() set field(field: FormField) {
    this._field = field;
    this.labels = [];
    if (field.enum) {
      this.labels = [IGNORE_VALUE, ...field.enumNames];
    }
  }

  ngOnInit() {
  }

  valueMapped(value, label) {
    const mapping = {...this.mapping};

    if (label === IGNORE_VALUE) {
      mapping[value] = label;
    } else if (this._field.enumNames) {
      const idx = this._field.enumNames.indexOf(label);
      if (idx > -1) {
        mapping[value] = this._field.enum[idx];
      }
    }
    this.mappingChanged.emit(mapping);
  }

}

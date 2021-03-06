import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IFormField, VALUE_IGNORE } from '../../../model/excel';

@Component({
  selector: 'laji-cell-value-select',
  templateUrl: './cell-value-select.component.html',
  styleUrls: ['./cell-value-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellValueSelectComponent {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  _field: IFormField;
  labels: string[] = [];
  ignore = VALUE_IGNORE;
  booleanValues = [VALUE_IGNORE, 'true', 'false'];

  @Input() set field(field: IFormField) {
    this._field = field;
    this.labels = [];

    if (field.enum) {
      this.labels = [VALUE_IGNORE, ...field.enumNames];
    }
  }

  valueMapped(value, to) {
    const mapping = {...this.mapping};

    if (to === VALUE_IGNORE) {
      mapping[value] = to;
    } else if (this._field.enumNames) {
      const idx = this._field.enumNames.indexOf(to);
      if (idx > -1) {
        mapping[value] = this._field.enum[idx];
      }
    } else if (this._field.type === 'integer') {
      mapping[value] = +to;
    } else if (this._field.type === 'boolean') {
      mapping[value] = to === 'true';
    } else if (typeof to !== 'undefined') {
      mapping[value] = to;
    }
    this.mappingChanged.emit(mapping);
  }
}

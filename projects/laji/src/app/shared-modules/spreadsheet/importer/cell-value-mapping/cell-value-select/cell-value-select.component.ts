import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IFormField, VALUE_IGNORE } from '../../../model/excel';

@Component({
  selector: 'laji-cell-value-select',
  templateUrl: './cell-value-select.component.html',
  styleUrls: ['./cell-value-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellValueSelectComponent {

  @Input() invalidValues?: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  _field!: IFormField;
  labels: string[] = [];
  ignore = VALUE_IGNORE;
  booleanValueMap: {[key: string]: typeof VALUE_IGNORE|boolean} = {};
  booleanValues: string[] = [];

  @Input() set field(field: IFormField) {
    this._field = field;
    this.labels = [];

    if (field.enum) {
      this.labels = [VALUE_IGNORE, ...field.enum.map(item => item.title)];
    }
  }

  constructor(
    private translate: TranslateService
  ) {
    this.booleanValueMap = {
      [VALUE_IGNORE]: VALUE_IGNORE,
      [this.translate.instant('yes')]: true,
      [this.translate.instant('no')]: false
    };
    this.booleanValues = Object.keys(this.booleanValueMap);
   }

  valueMapped(value: any, to: any) {
    const mapping = {...this.mapping};

    if (to === VALUE_IGNORE) {
      mapping[value] = to;
    } else if (this._field.enum) {
      const enu = this._field.enum.find(item => item.title === to);
      if (enu) {
        mapping[value] = enu.const;
      }
    } else if (this._field.type === 'integer') {
      mapping[value] = +to;
    } else if (this._field.type === 'boolean') {
      mapping[value] = this.booleanValueMap[to];
    } else if (typeof to !== 'undefined') {
      mapping[value] = to;
    }
    this.mappingChanged.emit(mapping);
  }
}

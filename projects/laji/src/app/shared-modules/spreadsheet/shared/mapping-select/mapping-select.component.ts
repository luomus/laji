import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IFormField, VALUE_AS_IS, VALUE_IGNORE } from '../../model/excel';
import { SpreadsheetService } from '../../service/spreadsheet.service';

@Component({
  selector: 'laji-mapping-select',
  templateUrl: './mapping-select.component.html',
  styleUrls: ['./mapping-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingSelectComponent {

  @Input() options?: string[];
  @Input() disabledWhenNoOptions = false;
  _value?: string;
  @Input() disabled = false;
  @Output() selected = new EventEmitter<string>();
  skipValue = VALUE_IGNORE;
  asIsValue = VALUE_AS_IS;

  fieldGroups: string[] = [];
  groups?: {[group: string]: string[]};
  fieldGroupsLabel: {[group: string]: string} = {};
  _fields?: {[key: string]: IFormField};

  @Input()
  set value(value: string) {
    if (value && this.options && this.options.indexOf(value) === -1 && !this._fields) {
      this._value = VALUE_AS_IS;
    } else {
      this._value = value;
    }
  }

  @Input()
  set fields(fields: {[key: string]: IFormField}) {
    this._fields = fields;
    const groups = {};
    Object.keys(fields).forEach(key => {
      if (!(groups as any)[fields[key].parent]) {
        (groups as any)[fields[key].parent] = [];
        const parts = fields[key].fullLabel.split(SpreadsheetService.nameSeparator);
        (this.fieldGroupsLabel as any)[fields[key].parent] = parts.pop();
      }
      (groups as any)[fields[key].parent].push(key);
    });
    this.fieldGroups = Object.keys(groups);
    this.groups = groups;
  }
}

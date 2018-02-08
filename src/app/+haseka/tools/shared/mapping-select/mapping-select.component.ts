import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField, IGNORE_VALUE } from '../../model/form-field';
import {SpreadSheetService} from '../../service/spread-sheet.service';

@Component({
  selector: 'laji-mapping-select',
  templateUrl: './mapping-select.component.html',
  styleUrls: ['./mapping-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MappingSelectComponent implements OnInit {

  @Input() options: string[] = [];
  @Input() value: string;
  @Input() disabled = false;
  @Output() selected = new EventEmitter<string>();
  skipValue = IGNORE_VALUE;

  fieldGroups: string[] = [];
  groups: {[group: string]: string[]};
  fieldGroupsLabel: {[group: string]: string} = {};
  _fields: {[key: string]: FormField};

  constructor() {}

  @Input()
  set fields(fields: {[key: string]: FormField}) {
    this._fields = fields;
    const groups = {};
    Object.keys(fields).forEach(key => {
      if (!groups[fields[key].parent]) {
        groups[fields[key].parent] = [];
        const parts = fields[key].fullLabel.split(SpreadSheetService.nameSeparator);
        this.fieldGroupsLabel[fields[key].parent] = parts.pop();
      }
      groups[fields[key].parent].push(key);
    });
    this.fieldGroups = Object.keys(groups);
    this.groups = groups;
  }

  ngOnInit() {
  }
}

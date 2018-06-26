import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField } from '../../model/form-field';

@Component({
  selector: 'laji-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldListComponent implements OnInit {

  @Input() selected: string[] = [];
  @Input() title = '';
  @Input() showTitle = true;
  @Output() toggle = new EventEmitter<FormField|FormField[]>();
  visibleFields: {
    subGroup: string;
    fields: FormField[]
  }[];
  _fields: FormField[];
  _parent: string;

  constructor() { }

  ngOnInit() {
  }

  onClick(field: FormField) {
    if (!field.required) {
      this.toggle.emit(field);
    }
  }

  onSubGroupClick(subGroup) {
    this.visibleFields.forEach(group => {
      if (group.subGroup === subGroup) {
        this.toggle.emit(group.fields);
      }
    })
  }

  onTitleClick() {
    const allVisible = [];
    this.visibleFields.forEach(group => {
      allVisible.push(...group.fields);
    });
    this.toggle.emit(allVisible);
  }

  @Input()
  set fields(fields: FormField[]) {
    this._fields = fields;
    this.initVisibleFields();
  }

  @Input()
  set parent(parent: string) {
    this._parent = parent;
    this.initVisibleFields();
  }

  private initVisibleFields() {
    if (!this._parent || !this._fields) {
      return;
    }
    const visibleFields = this._fields.reduce((cumulative, current) => {
      if (current.parent !== this._parent) {
        return cumulative;
      }
      const subGroup = current.subGroup || '';
      if (!cumulative[subGroup]) {
        cumulative[subGroup] = {
          subGroup: subGroup,
          fields: []
        }
      }
      cumulative[subGroup].fields.push(current);
      return cumulative;
    }, {});
    this.visibleFields = Object.keys(visibleFields).map(key => visibleFields[key]);
  }

}

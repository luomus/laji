import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IFormField } from '../../model/excel';

@Component({
  selector: 'laji-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldListComponent implements OnChanges {

  @Input() parent?: string;
  @Input() fields?: IFormField[];
  @Input() selected: string[] = [];
  @Input() title = '';
  @Input() showTitle = true;

  @Output() toggle = new EventEmitter<IFormField|IFormField[]>();
  @Output() selectedChange = new EventEmitter<string[]>();

  idx?: number;
  visibleFields!: {
    subGroup: string;
    fields: IFormField[];
  }[];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] || changes['parent']) {
      this.initVisibleFields();
    }
  }

  onClick(field: IFormField) {
    if (!field.required) {
      this.toggle.emit(field);
    }
  }

  onSubGroupClick(subGroup: string) {
    this.visibleFields.forEach(group => {
      if (group.subGroup === subGroup) {
        this.toggle.emit(group.fields);
      }
    });
  }

  onTitleClick() {
    const allVisible: IFormField[] = [];
    this.visibleFields.forEach(group => {
      allVisible.push(...group.fields);
    });
    this.toggle.emit(allVisible);
  }

  trackFields(index: number, field: IFormField): string {
    return field.key;
  }

  private initVisibleFields() {
    if (!this.parent || !this.fields) {
      return;
    }
    const visibleFields = this.fields.reduce((fields, current) => {
      if (current.parent !== this.parent) {
        return fields;
      }
      const subGroup = current.subGroup || '';
      if (!fields[subGroup]) {
        fields[subGroup] = {
          subGroup,
          fields: []
        };
      }
      fields[subGroup].fields.push(current);
      return fields;
    }, {} as any);
    this.visibleFields = Object.keys(visibleFields).map(key => visibleFields[key]);
  }
}

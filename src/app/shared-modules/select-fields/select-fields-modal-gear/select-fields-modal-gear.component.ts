import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ISelectFields } from '../select-fields/select-fields.component';

@Component({
  selector: 'laji-select-fields-modal-gear',
  templateUrl: './select-fields-modal-gear.component.html',
  styleUrls: ['./select-fields-modal-gear.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFieldsModalGearComponent {

  @Input() defaultFields: ISelectFields[];
  @Input() selectedFields: ISelectFields[] = [];
  @Input() allSelectableFields: ISelectFields[] = [];

  @Input() btnClass: string;
  @Input() modalTitle: string;
  @Input() selectedFieldsTitle: string;
  @Input() allSelectableFieldsTitle: string;
  @Input() labelClose = 'close';
  @Input() labelReset = 'reset';

  @Output() selectedFieldsChange = new EventEmitter<ISelectFields[]>();
  selectedCache: ISelectFields[];

  constructor(private cdr: ChangeDetectorRef) { }

  updateSelected(fields: ISelectFields[]) {
    this.selectedCache = fields;
  }

  reset() {
    this.selectedFields = [...this.defaultFields];
    this.selectedCache = this.selectedFields;
    this.cdr.markForCheck();
  }
}

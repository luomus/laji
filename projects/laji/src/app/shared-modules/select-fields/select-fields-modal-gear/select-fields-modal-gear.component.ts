import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ISelectFields } from '../select-fields/select-fields.component';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

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
  @Input() labelOpen = 'open';
  @Input() labelClose = 'close';
  @Input() labelReset = 'reset';

  @Output() selectedFieldsChange = new EventEmitter<ISelectFields[]>();
  selectedCache: ISelectFields[];

  @ViewChild('modal') fieldsModal: ModalComponent;

  constructor(private cdr: ChangeDetectorRef) { this.selectedFieldsChange.subscribe(v => console.log(v));}

  updateSelected(fields: ISelectFields[]) {
    this.selectedCache = fields;
  }

  reset() {
    this.selectedFields = [...this.defaultFields];
    this.selectedCache = this.selectedFields;
    this.cdr.markForCheck();
  }
}

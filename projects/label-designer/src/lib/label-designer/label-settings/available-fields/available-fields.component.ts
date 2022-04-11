import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FieldType, ILabelField } from '../../../label-designer.interface';

interface ILabelFieldWithIdx extends ILabelField {
  idx: number;
}

/**
 * @internal
 */
@Component({
  selector: 'll-available-fields',
  templateUrl: './available-fields.component.html',
  styleUrls: ['./available-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvailableFieldsComponent implements OnChanges {
  @Input() availableFields: ILabelField[];
  @Input() includeTextField = true;
  @Input() placeholder = 'add';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<ILabelField>();

  fieldType = FieldType;

  availableFieldsWithIdx: ILabelFieldWithIdx[] = [];
  selectedIdx?: number;

  ngOnChanges() {
    this.availableFieldsWithIdx = (this.availableFields || []).map((field, idx) => ({
      ...field,
      idx
    }));
    this.selectedIdx = this.availableFields?.findIndex(
      field => field.field === this.value && !(field.type == this.fieldType.qrCode || field.type == this.fieldType.text)
    );
  }

  doValueSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    select.value = '';
    const idx = parseInt(value);
    if (!isNaN(idx)) {
      this.valueChange.emit({...this.availableFields[idx]});
    } else {
      this.valueChange.emit(null);
    }
  }
}

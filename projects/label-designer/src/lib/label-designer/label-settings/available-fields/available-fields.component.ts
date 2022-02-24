import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
export class AvailableFieldsComponent {

  @Input() includeTextFields = true;
  @Input() placeholder = 'add';
  @Input() value = '';

  @Output() valueChange = new EventEmitter<ILabelField>();

  fieldType = FieldType;
  _availableFields: ILabelFieldWithIdx[] = [];

  @Input() set availableFields(availableFields: ILabelField[]) {
    this._availableFields = (availableFields || []).map((field, idx) => ({
      ...field,
      idx: idx
    }));
  }

  doValueSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    select.value = '';
    const idx = parseInt(value);
    if (!isNaN(idx)) {
      this.valueChange.emit({...this._availableFields[idx]});
    } else {
      this.valueChange.emit(null);
    }
  }
}

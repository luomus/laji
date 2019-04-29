import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldType, ILabelField } from '../../../generic-label-maker.interface';

@Component({
  selector: 'll-field-add',
  templateUrl: './field-add.component.html',
  styleUrls: ['./field-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldAddComponent {

  @Input() availableFields: ILabelField[];

  @Output() add = new EventEmitter<ILabelField>();

  fieldType = FieldType;


  doAdd(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    select.value = '';
    if (this.availableFields[value]) {
      this.add.emit({...this.availableFields[value]});
    }
  }
}

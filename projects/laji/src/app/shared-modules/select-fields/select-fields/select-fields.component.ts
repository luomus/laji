import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface ISelectFields {
  label: string;
  key: string;
}

@Component({
  selector: 'laji-select-fields',
  templateUrl: './select-fields.component.html',
  styleUrls: ['./select-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFieldsComponent {

  @Input() selectedFields: ISelectFields[] = [];
  @Input() allSelectableFields: ISelectFields[] = [];

  @Input() selectedFieldsTitle: string;
  @Input() allSelectableFieldsTitle: string;

  @Output() selectedFieldsChange = new EventEmitter<ISelectFields[]>();

  constructor() { }

  drop(event: CdkDragDrop<ISelectFields[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.selectedFieldsChange.emit(this.selectedFields);
  }
}

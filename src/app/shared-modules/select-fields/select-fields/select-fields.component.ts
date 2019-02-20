import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface ISelectFields {
  label: string;
  key: string;
}

@Component({
  selector: 'laji-select-fields',
  templateUrl: './select-fields.component.html',
  styleUrls: ['./select-fields.component.scss']
})
export class SelectFieldsComponent implements OnInit {

  @Input() selectedFields: ISelectFields[] = [];
  @Input() allSelectableFields: ISelectFields[] = [];

  @Input() selectedFieldsTitle: string;
  @Input() allSelectableFieldsTitle: string;

  @Output() selectedFieldsChange = new EventEmitter<ISelectFields[]>();

  constructor() { }

  ngOnInit() {
  }

  drop(event: CdkDragDrop<ISelectFields[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    if (event.container.data === this.selectedFields) {
      this.selectedFieldsChange.emit(event.container.data);
    }
  }
}

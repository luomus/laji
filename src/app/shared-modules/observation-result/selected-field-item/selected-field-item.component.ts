import { ChangeDetectionStrategy, Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-selected-field-item',
  templateUrl: './selected-field-item.component.html',
  styleUrls: ['./selected-field-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldItemComponent {

  @Input() field: string;
  @Input() label: string;
  @Input() idx: number;
  @Input() len: number;

  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string>();
  @Output() moveDown = new EventEmitter<string>();

  constructor() { }

  moveFieldDown(field, event) {
    event.stopPropagation();
    this.moveDown.emit(field)
  }

  moveFieldUp(field, event) {
    event.stopPropagation();
    this.moveUp.emit(field)
  }

}

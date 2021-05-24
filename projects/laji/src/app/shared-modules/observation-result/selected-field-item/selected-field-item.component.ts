import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-selected-field-item',
  templateUrl: './selected-field-item.component.html',
  styleUrls: ['./selected-field-item.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldItemComponent {

  @Input() field: string | string[];
  @Input() label: string;
  @Input() idx: number;
  @Input() len: number;
  @Input() required: boolean;

  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string | string[]>();
  @Output() moveDown = new EventEmitter<string | string[]>();

  moveFieldDown(field, event) {
    event.stopPropagation();
    this.moveDown.emit(field);
  }

  moveFieldUp(field, event) {
    event.stopPropagation();
    this.moveUp.emit(field);
  }

  isArray(field: string | string[]) {
    return Array.isArray(field)
  }
}

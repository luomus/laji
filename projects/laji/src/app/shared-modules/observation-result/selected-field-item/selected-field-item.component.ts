import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'laji-selected-field-item',
  templateUrl: './selected-field-item.component.html',
  styleUrls: ['./selected-field-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldItemComponent {

  @Input() field?: string[];
  @Input() label?: string;
  @Input() idx?: number[];
  @Input() len?: number;
  @Input() required?: boolean;

  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string[]>();
  @Output() moveDown = new EventEmitter<string[]>();

  moveFieldDown(field: any, event: any) {
    event.stopPropagation();
    this.moveDown.emit(field);
  }

  moveFieldUp(field: any, event: any) {
    event.stopPropagation();
    this.moveUp.emit(field);
  }
}

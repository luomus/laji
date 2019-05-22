import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnSelector } from 'app/shared/columnselector/ColumnSelector';

@Component({
  selector: 'laji-selected-field-group',
  templateUrl: './selected-field-group.component.html',
  styleUrls: ['./selected-field-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldGroupComponent {

  @Input() header: string;
  @Input() fields: string[] = [];
  @Input() selected: string[] = [];
  @Input() disabled: string[] = [];
  @Input() columnsLookup: any = {};

  @Input() columnSelector: ColumnSelector;

  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string>();
  @Output() moveDown = new EventEmitter<string>();

  constructor() { }

  onToggle(field: string) {
    if (this.disabled.indexOf(field) === -1) {
      this.toggle.emit(field);

      if (this.columnSelector) {
        this.columnSelector.toggleSelectedField(field);
      }
    }
  }

  onMoveUp(field: string) {
    this.moveUp.emit(field);

    if (this.columnSelector) {
      this.columnSelector.moveFieldByName(field, -1);
    }
  }

  onMoveDown(field: string) {
    this.moveDown.emit(field);

    if (this.columnSelector) {
      this.columnSelector.moveFieldByName(field, 1);
    }
  }
}

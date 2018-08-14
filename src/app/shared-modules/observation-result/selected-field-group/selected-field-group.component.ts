import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

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
  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string>();
  @Output() moveDown = new EventEmitter<string>();

  constructor() { }

  onToggle(field: string) {
    if (this.disabled.indexOf(field) === -1) {
      this.toggle.emit(field);
    }
  }
}

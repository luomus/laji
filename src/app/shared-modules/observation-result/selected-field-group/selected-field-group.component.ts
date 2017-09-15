import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'laji-selected-field-group',
  templateUrl: './selected-field-group.component.html',
  styleUrls: ['./selected-field-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldGroupComponent {

  @Input() title: string;
  @Input() fields: string[] = [];
  @Input() selected: string[] = [];
  @Input() columnsLookup: any = {};
  @Output() toggle = new EventEmitter<string>();

  constructor() { }

}

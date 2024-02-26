import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'laji-selected-field-item',
  templateUrl: './selected-field-item.component.html',
  styleUrls: ['./selected-field-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldItemComponent implements OnInit {

  @Input() field: string[];
  @Input() label: string;
  @Input() idx: number[];
  @Input() len: number;
  @Input() required: boolean;

  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string[]>();
  @Output() moveDown = new EventEmitter<string[]>();

  ngOnInit() {
    console.log(this.field, this.label, this.idx, this.len, this.required);
  }

  moveFieldDown(field, event) {
    event.stopPropagation();
    this.moveDown.emit(field);
  }

  moveFieldUp(field, event) {
    event.stopPropagation();
    this.moveUp.emit(field);
  }
}

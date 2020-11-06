import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IFormField } from '../../model/excel';

@Component({
  selector: 'laji-field-item',
  templateUrl: './field-item.component.html',
  styleUrls: ['./field-item.component.scss']
})
export class FieldItemComponent implements OnChanges {

  @Input() field: IFormField;
  @Input() selected: string[];

  @Output() selectedChange = new EventEmitter<string[]>();

  idx: number;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || changes['selected']) {
      this.initSpot();
    }
  }

  onSplitClick(event: MouseEvent) {
    event.stopPropagation();
  }

  onSplitChange(field: IFormField, value: any) {
    field.splitType = value;
  }

  private initSpot() {
    if (!this.field || !this.selected) {
      return;
    }
    this.idx = this.selected.indexOf(this.field.key);
  }

  moveFieldUp(field: IFormField, event: MouseEvent) {
    event.stopPropagation();
    this.move(Math.min(this.selected.length - 1, this.idx + 1));
  }

  moveFieldDown(field: IFormField, event: MouseEvent) {
    event.stopPropagation();
    this.move(Math.max(0, this.idx - 1));
  }

  private move(toIdx: number) {
    if (this.idx === toIdx && this.selected) {
      return;
    }
    const selected = [...this.selected];
    const item = selected[this.idx];
    selected.splice(this.idx, 1);
    selected.splice(toIdx, 0, item);

    this.selectedChange.emit(selected);
  }
}

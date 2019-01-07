import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { Label, LabelItem, LabelItemSelectAction } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.scss']
})
export class LabelEditorComponent {

  _label: Label;
  _magnification = 2;

  height: number;
  width: number;
  active: LabelItem;
  init = false;

  @Input() labelItem: LabelItem[] = [];
  @Output() labelItemChange = new EventEmitter<LabelItem[]>();
  @Output() showSettings = new EventEmitter<LabelItemSelectAction>();

  constructor(labelService: LabelService) {
    this.init = labelService.hasRation();
  }

  @Input()
  set label(label: Label) {
    this._label = label;
    this.recalculate();
  }

  @Input()
  set magnification(mag: number) {
    this._magnification = mag;
    this.recalculate();
  }

  recalculate() {
    if (!this._label) {
      return;
    }
    this.height = this._label.height * this._magnification;
    this.width = this._label.width * this._magnification;
  }

  onItemChange(originalItem: LabelItem, newItem: LabelItem) {
    const result = [];
    this.labelItem.forEach(item => {
      result.push(item === originalItem ? newItem : item);
    });
    this.labelItemChange.emit(result);
  }
}

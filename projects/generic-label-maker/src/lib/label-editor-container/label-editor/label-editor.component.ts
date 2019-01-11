import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { LabelItem, LabelItemSelectAction, Setup } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.scss']
})
export class LabelEditorComponent {

  _setup: Setup;
  _magnification = 2;

  height: number;
  width: number;
  active: LabelItem;
  init = false;

  @Output() setupChange = new EventEmitter<Setup>();
  @Output() showSettings = new EventEmitter<LabelItemSelectAction>();

  constructor(labelService: LabelService) {
    this.init = labelService.hasRation();
  }

  @Input()
  set setup(setup: Setup) {
    this._setup = setup;
    this.recalculate();
  }

  @Input()
  set magnification(mag: number) {
    this._magnification = mag;
    this.recalculate();
  }

  recalculate() {
    if (!this._setup) {
      return;
    }
    this.height = this._setup.label['height.mm'] * this._magnification;
    this.width = this._setup.label['width.mm'] * this._magnification;
  }

  onItemChange(originalItem: LabelItem, newItem: LabelItem) {
    const result = [];
    this._setup.labelItems.forEach(item => {
      result.push(item === originalItem ? newItem : item);
    });
    this._setup = {
      ...this._setup,
      labelItems: result
    };
    this.setupChange.emit(this._setup);

  }
}

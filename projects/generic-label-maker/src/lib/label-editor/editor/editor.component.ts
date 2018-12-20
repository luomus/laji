import { Component, Input, OnInit } from '@angular/core';
import { Label, LabelItem } from '../../generic-label-maker.interface';

@Component({
  selector: 'll-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  _label: Label;
  _magnification = 2;

  height: number;
  width: number;
  active: LabelItem;

  @Input() labelItem: LabelItem[] = [];

  constructor() { }

  ngOnInit() {
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

  onDrop(event) {
    console.log('dropEvent', event);
  }
}

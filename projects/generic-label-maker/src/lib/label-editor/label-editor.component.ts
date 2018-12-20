import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LabelField, LabelItem, Setup } from '../generic-label-maker.interface';
import { GenericLabelMakerService } from '../generic-label-maker.service';

@Component({
  selector: 'll-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.scss']
})
export class LabelEditorComponent implements OnInit {

  _setup: Setup = GenericLabelMakerService.EmptySetup;
  _mockItems: LabelItem[];
  @Input() availableFields: LabelField[];

  @Output() setupChange = new EventEmitter<Setup>();

  constructor() { }

  ngOnInit() {
    if (this.availableFields) {
      this._mockItems = this.availableFields.map((a, i) => ({
        type: 'field',
        height: 4,
        width: 20,
        y: i * 5,
        x: 10,
        fields: [a],
        margin: {}
      })).splice(0, 4);
    }
  }

  @Input()
  set setup(setup: Setup) {
    this._setup = setup;
  }

  onDragEnd(event) {
    console.log(event);
  }
}

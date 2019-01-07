import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LabelField, LabelItem, LabelItemSelectAction, Setup } from '../generic-label-maker.interface';
import { LabelService } from '../label.service';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'll-label-editor-container',
  templateUrl: './label-editor-container.component.html',
  styleUrls: ['./label-editor-container.component.scss']
})
export class LabelEditorContainerComponent implements OnInit {

  _active: 'settings'|'fields' = 'fields';
  _setup: Setup = LabelService.EmptySetup;
  _mockItems: LabelItem[];
  _selectedLabelItem: LabelItemSelectAction;
  @Input() availableFields: LabelField[];

  @Output() setupChange = new EventEmitter<Setup>();

  constructor() { }

  ngOnInit() {
    if (this.availableFields) {
      this._mockItems = this.availableFields.map((a, i) => ({
        type: 'field',
        height: i === 0 ? 13 : 4,
        width: i === 0 ? 13 : 20,
        y: i === 0 ? 0 : (i - 1) * 5,
        x: i === 0 ? 0 : 15,
        fields: i === 4 ? [a, this.availableFields[5]] : [a],
        margin: {}
      })).splice(0, 5);
    }
  }

  @Input()
  set setup(setup: Setup) {
    this._setup = setup;
  }

  showSettings(action: LabelItemSelectAction) {
    this._selectedLabelItem = action;
    this._active = 'settings';
  }

  onNewFieldDragEnd(event: CdkDragEnd) {
    const field: LabelField = JSON.parse(JSON.stringify(event.source.data));
    this._mockItems = [...this._mockItems, ({
      type: 'field',
      height: 4,
      width: 20,
      y: 10,
      x: 25,
      fields: [field],
      margin: {}
    })];
    event.source.reset();
  }
}

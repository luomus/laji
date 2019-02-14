import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LabelField, LabelItem, Setup } from '../generic-label-maker.interface';

@Component({
  selector: 'll-label-editor-container',
  templateUrl: './label-editor-container.component.html',
  styleUrls: ['./label-editor-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelEditorContainerComponent {

  static id = 0;

  _active: 'file'|'settings'|'fields' = 'file';
  _setup: Setup;
  _selectedLabelItem: LabelItem | undefined;
  @Input() magnification = 2;
  @Input() availableFields: LabelField[];
  @Input() data: object[];

  @Output() html = new EventEmitter<string>();
  @Output() setupChange = new EventEmitter<Setup>();

  constructor() { }

  @Input()
  set setup(setup: Setup) {
    this._setup = {
      ...setup,
      labelItems: setup.labelItems.map(item => ({
        ...item,
        _id: item._id || LabelEditorContainerComponent.id++
      }))
    };
    if (this._selectedLabelItem) {
      const idx = this._setup.labelItems.findIndex(i => i._id === this._selectedLabelItem._id);
      this._selectedLabelItem = this._setup.labelItems[idx];
    }
  }

  showSettings(item: LabelItem) {
    this.setActiveLabelItem(item);
    this._active = 'settings';
  }

  setActiveLabelItem(item: LabelItem) {
    console.log('SETTING ITEM');
    this._selectedLabelItem = item;
  }

  setupChanged(setup: Setup) {
    this._setup = setup;
    this.setupChange.emit(this._setup);
  }

  addLabelItem(item: LabelItem) {
    if (!item._id) {
      item._id = LabelEditorContainerComponent.id++;
    }
    this._setup = {...this._setup, labelItems: [...this._setup.labelItems, item]};
    this.setupChange.emit(this._setup);
  }

  done() {
    this._selectedLabelItem = undefined;
  }
}

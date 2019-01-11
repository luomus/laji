import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LabelField, LabelItem, LabelItemSelectAction, Setup } from '../generic-label-maker.interface';
import { Presets } from '../presets';

@Component({
  selector: 'll-label-editor-container',
  templateUrl: './label-editor-container.component.html',
  styleUrls: ['./label-editor-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelEditorContainerComponent {

  _active: 'settings'|'fields' = 'fields';
  _setup: Setup = Presets.A4;
  _selectedLabelItem: LabelItemSelectAction;
  @Input() availableFields: LabelField[];

  @Output() setupChange = new EventEmitter<Setup>();

  constructor() { }

  @Input()
  set setup(setup: Setup) {
    this._setup = setup;
  }

  showSettings(action: LabelItemSelectAction) {
    this._selectedLabelItem = action;
    this._active = 'settings';
  }

  setupChanged(setup: Setup) {
    this._setup = setup;
    this.setupChange.emit(this._setup);
  }

  addLabelItem(item: LabelItem) {
    this._setup = {...this._setup, labelItems: [...this._setup.labelItems, item]};
    this.setupChange.emit(this._setup);
  }
}

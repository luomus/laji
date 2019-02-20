import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IAddLabelEvent, ILabelField, ILabelItem, ISetup } from '../generic-label-maker.interface';

@Component({
  selector: 'll-label-editor-container',
  templateUrl: './label-editor-container.component.html',
  styleUrls: ['./label-editor-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelEditorContainerComponent {

  static id = 0;

  _active: 'file'|'edit'|'settings'|'fields' = 'file';
  _setup: ISetup;
  _selectedLabelItem: ILabelItem | undefined;
  @Input() magnification = 2;
  @Input() availableFields: ILabelField[];
  @Input() data: object[];

  @Output() html = new EventEmitter<string>();
  @Output() setupChange = new EventEmitter<ISetup>();

  private _undo: ISetup[] = [];
  private _redo: ISetup[] = [];

  constructor() { }

  @Input()
  set setup(setup: ISetup) {
    this._setup = {
      ...setup,
      labelItems: setup.labelItems.map(item => ({
        ...item,
        _id: item._id || LabelEditorContainerComponent.id++
      })),
      backSideLabelItems: (setup.backSideLabelItems || []).map(item => ({
        ...item,
        _id: item._id || LabelEditorContainerComponent.id++
      }))
    };
    if (this._selectedLabelItem) {
      let idx = this._setup.labelItems.findIndex(i => i._id === this._selectedLabelItem._id);
      if (idx !== -1) {
        this._selectedLabelItem = this._setup.labelItems[idx];
      } else {
        idx = this._setup.backSideLabelItems.findIndex(i => i._id === this._selectedLabelItem._id);
        this._selectedLabelItem = this._setup.backSideLabelItems[idx];
      }
    }
  }

  showSettings(item: ILabelItem) {
    this.setActiveLabelItem(item);
    this._active = 'settings';
  }

  setActiveLabelItem(item: ILabelItem) {
    this._selectedLabelItem = item;
  }

  setupChanged(setup: ISetup, addToUndo = true) {
    if (addToUndo) {
      this._redo = [];
      this._undo.push(this._setup);
    }
    this._setup = setup;
    this.setupChange.emit(this._setup);
    if (this._undo.length > 20) {
      this._undo.shift();
    }
  }

  addLabelItem(event: IAddLabelEvent) {
    const item = event.item;
    if (!item._id) {
      item._id = LabelEditorContainerComponent.id++;
    }
    this._undo.push(this._setup);
    this._setup = {...this._setup, [event.location]: [...this._setup[event.location], item]};
    this.setupChange.emit(this._setup);
  }

  done() {
    this._selectedLabelItem = undefined;
  }

  undo() {
    if (this.hasUndo()) {
      this._redo.push(this._setup);
      this.setupChanged(this._undo.pop(), false);
    }
  }

  redo() {
    if (this.hasRedo()) {
      this._undo.push(this._setup);
      this.setupChanged(this._redo.pop(), false);
    }
  }

  hasUndo() {
    return this._undo.length > 0;
  }

  hasRedo() {
    return this._redo.length > 0;
  }
}

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
  fields: ILabelField[];
  @Input() magnification = 2;
  @Input() availableFields: ILabelField[];
  @Input() data: object[];

  @Output() html = new EventEmitter<string>();
  @Output() setupChange = new EventEmitter<ISetup>();

  generate: {
    uri: string;
    rangeStart: number;
    rangeEnd: number;
    data: {[key: string]: string}
  } = {
    uri: '',
    rangeStart: 1,
    rangeEnd: 10,
    data: {}
  };

  private _undo: ISetup[] = [];
  private _redo: ISetup[] = [];

  constructor() { }

  @Input()
  set setup(setup: ISetup) {
    const hasField = {};
    const allFields = [];
    this._setup = {
      ...setup,
      labelItems: setup.labelItems.map(item => {
        item.fields.forEach(field => {
          if (!hasField[field.field] && !field.type && field.field !== 'id') {
            hasField[field.field] = true;
            allFields.push(field);
          }
        });
        return {
        ...item,
          _id: item._id || LabelEditorContainerComponent.id++
        };
      }),
      backSideLabelItems: (setup.backSideLabelItems || []).map(item => {
        item.fields.forEach(field => {
          if (!hasField[field.field] && !field.type && field.field !== 'id') {
            hasField[field.field] = true;
            allFields.push(field);
          }
        });
        return {
          ...item,
          _id: item._id || LabelEditorContainerComponent.id++
        };
      })
    };
    this.fields = allFields;
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

  updateGenerate(key: string, value: string, inData = false) {
    if (inData) {
      this.generate = {
        ...this.generate,
        data: {
          ...this.generate.data,
          [key]: value
        }
      };
    } else {
      this.generate = {
        ...this.generate,
        [key]: key === 'uri' ? value : Number(value)
      };
    }
  }

  generateData() {
    const uri = this.generate.uri + (this.generate.uri.indexOf('%id%') > -1 ? '' : '%id%');
    const data = [];
    const start = this.generate.rangeStart < this.generate.rangeEnd ? this.generate.rangeStart : this.generate.rangeEnd;
    const end = this.generate.rangeStart > this.generate.rangeEnd ? this.generate.rangeStart : this.generate.rangeEnd;
    const MAX = 100000;
    let current = 0;
    for (let i = start; i <= end; i++) {
      current++;
      if (current > MAX) {
        break;
      }
      data.push({
        ...this.generate.data,
        id: uri.replace('%id%', '' + i)
      });
    }
    this.data = data;
    if  (this.data[0]) {
      this.setAsExample(this.data[0]);
    }
  }

  private setAsExample(doc: any) {
    this._setup = {
      ...this._setup,
      labelItems: this.setExampleInLabelItems(doc, this._setup.labelItems),
      backSideLabelItems: this.setExampleInLabelItems(doc, this._setup.backSideLabelItems)
    };
  }

  private setExampleInLabelItems(doc: any, items: ILabelItem[]): ILabelItem[] {
    return items.map(item => ({
      ...item,
      fields: item.fields.map(field => ({...field, content: doc[field.field]}))
    }));
  }
}

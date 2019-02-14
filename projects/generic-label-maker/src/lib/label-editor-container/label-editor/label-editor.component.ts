import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
import { LabelItem, Setup } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelEditorComponent {

  _setup: Setup;
  _magnification = 2;

  height: number;
  width: number;
  init = false;

  @Input() active: LabelItem;
  @Output() activeChange = new EventEmitter<LabelItem>();
  @Output() setupChange = new EventEmitter<Setup>();
  @Output() showSettings = new EventEmitter<LabelItem>();
  @Output() done = new EventEmitter<void>();

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
    this.height = this._setup.label['height.mm'];
    this.width = this._setup.label['width.mm'];
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

  updateDimensions(event: Event, target: string, sec: 'page'|'label') {
    const value = Number((event.target as HTMLInputElement).value);
    this._setup = {
      ...this._setup,
      [sec]: {
        ...this._setup[sec],
        [target]: value
      }
    };
    this.setupChange.emit(this._setup);
  }

  setActiveItem(item: LabelItem) {
    this.activeChange.emit(item);
  }
}

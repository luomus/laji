import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
import { ILabelItem, ISetup, TLabelLocation } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelEditorComponent {

  _setup: ISetup;
  _magnification = 2;

  height: number;
  width: number;
  init = false;

  @Input() active: ILabelItem;
  @Input() backSide = false;
  @Output() activeChange = new EventEmitter<ILabelItem>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() showSettings = new EventEmitter<ILabelItem>();
  @Output() done = new EventEmitter<void>();

  constructor(private labelService: LabelService) {
    this.init = labelService.hasRation();
  }

  @Input()
  set setup(setup: ISetup) {
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

  onItemChange(originalItem: ILabelItem, newItem: ILabelItem) {
    const result = [];
    const items: TLabelLocation = this.backSide ? 'backSideLabelItems' : 'labelItems';
    this._setup[items].forEach(item => {
      result.push(item === originalItem ? newItem : item);
    });
    this._setup = {
      ...this._setup,
      [items]: result
    };
    this.setupChange.emit(this._setup);

  }

  updateDimensions(event: Event, target: string, sec: 'page'|'label') {
    const value = Number((event.target as HTMLInputElement).value);
    const {width, height} = this.labelService.countMinLabelSize(this._setup);
    if ((target === 'height.mm' && value < height) || (target === 'width.mm' && value < width)) {
      return alert('Field within the label is blocking the resize.\nRemove or resize the field in the label!');
    }

    this._setup = {
      ...this._setup,
      [sec]: {
        ...this._setup[sec],
        [target]: value
      }
    };
    this.setupChange.emit(this._setup);
  }

  setActiveItem(item: ILabelItem) {
    this.activeChange.emit(item);
  }
}

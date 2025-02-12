import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, } from '@angular/core';
import { ILabelItem, ILabelStyle, IPageStyle, ISetup, TLabelLocation } from '../../label-designer.interface';
import { LabelService } from '../../label.service';
import { TranslateService } from '../../translate/translate.service';
import { LabelMakerFacade } from '../label-maker.facade';

/**
 * @internal
 */
@Component({
  selector: 'll-label-editor',
  templateUrl: './label-editor.component.html',
  styleUrls: ['./label-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelEditorComponent {

  _setup!: ISetup;
  _magnification = 2;
  _backSide = false;
  _magnifiedStyle!: ILabelStyle;
  init = false;
  minSize = 4;

  @Input() grid!: number;
  @Input() gridVisible!: boolean;
  @Input() active!: ILabelItem;
  @Output() activeChange = new EventEmitter<ILabelItem>();
  @Output() setupChange = new EventEmitter<ISetup>();
  @Output() showSettings = new EventEmitter<ILabelItem>();
  @Output() done = new EventEmitter<void>();

  constructor(
    private labelService: LabelService,
    private translateService: TranslateService,
    private labelMakerFacade: LabelMakerFacade
  ) {
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

  @Input()
  set backSide(backSide: boolean) {
    this._backSide = backSide;
    this.recalculate();
  }

  recalculate(): void {
    if (!this._setup) {
      return;
    }
    const resultStyle: ILabelStyle = {};
    (Object.keys(this._setup.label) as (keyof ILabelStyle)[]).forEach(prop => {
      if (typeof this._setup.label[prop] === 'number' && prop !== 'line-height') {
        (resultStyle as any)[prop] = this._setup.label[prop] as any * this._magnification;
      } else {
        (resultStyle as any)[prop] = this._setup.label[prop];
      }
    });
    if (this._backSide) {
      const marginLeft = resultStyle['marginLeft.mm'];
      resultStyle['marginLeft.mm'] = resultStyle['marginRight.mm'];
      resultStyle['marginRight.mm'] = marginLeft;
    }
    this._magnifiedStyle = resultStyle;
  }

  onItemChange(originalItem: ILabelItem, newItem: ILabelItem): void {
    const result: any = [];
    const items: TLabelLocation = this._backSide ? 'backSideLabelItems' : 'labelItems';
    (this._setup as any)[items].forEach((item: any) => {
      result.push(item === originalItem ? newItem : item);
    });
    this._setup = {
      ...this._setup,
      [items]: result
    };
    this.setupChange.emit(this._setup);
    this.labelMakerFacade.hasChanges(true);
  }

  updateDimensions(
    event: Event,
    target: keyof Pick<IPageStyle|ILabelStyle, 'height.mm'|'width.mm'>, sec: keyof Pick<ISetup, 'page'|'label'>
  ) {
    const element = event.target as HTMLInputElement;
    const value = Number(element.value);
    const {width, height} = this.labelService.countMinLabelSize(this._setup);
    if ((target === 'height.mm' && value < height) || (target === 'width.mm' && value < width)) {
      element.value = '' + this._setup[sec][target];
      return alert(this.translateService.get('Field within the label is blocking the resize!'));
    }
    if (value < this.minSize) {
      element.value = '' + this._setup[sec][target];
      return alert(this.translateService.get('Cannot make labels smaller than {{size}}mm!', {size: this.minSize}));
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

  setActiveItem(item: ILabelItem): void {
    this.activeChange.emit(item);
  }
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ILabelItem, ILabelStyle, ISetup } from '../generic-label-maker.interface';
import { LabelService } from '../label.service';

@Component({
  selector: 'll-label-preview',
  templateUrl: './label-preview.component.html',
  styleUrls: ['../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPreviewComponent {

  @Input() preview = true;
  @Input() data: object;
  @Input() backSide = false;

  items: ILabelItem[] = [];
  labelStyle: ILabelStyle;
  init;

  private _setup: ISetup;

  constructor(labelService: LabelService) {
    this.init = labelService.hasRation();
  }

  @Input() set setup(val: ISetup) {
    this._setup = val;
    const style = {...val.label};
    if (this.backSide) {
      this.items = val.backSideLabelItems;
      const swp = style['marginLeft.mm'];
      style['marginLeft.mm'] = style['marginRight.mm'];
      style['marginRight.mm'] = swp;
    } else {
      this.items = val.labelItems;
    }
    this.labelStyle = style;
  }

  get setup() {
    return this._setup;
  }

}

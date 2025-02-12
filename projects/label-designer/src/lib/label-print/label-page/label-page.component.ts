import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IPageLayout, IPageStyle, ISetup, QRCodeErrorCorrectionLevel } from '../../label-designer.interface';
import { LabelService } from '../../label.service';

/**
 * @internal
 */
@Component({
  selector: 'll-label-page',
  templateUrl: './label-page.component.html',
  styleUrls: ['../../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPageComponent implements AfterViewInit {

  @Input() data!: Record<string, any>[];
  @Input() qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;
  @Output() ready = new EventEmitter<void>();

  cols = '';
  rows = '';
  backStyle!: IPageStyle;
  private _setup!: ISetup;
  _dim!: IPageLayout;

  @Input() set setup(val: ISetup) {
    this._setup = val;
    if (val.twoSided) {
      const style = {...val.page};
      const swp = style['paddingLeft.mm'];
      style['paddingLeft.mm'] = style['paddingRight.mm'];
      style['paddingRight.mm'] = swp;
      this.backStyle = style;
    }
    this.initColsAndRows();
  }

  get setup() {
    return this._setup;
  }

  ngAfterViewInit() {
    // QRCodes will not be included if there is no setTimeout here
    setTimeout(() => {
      this.ready.emit();
    }, 300);
  }

  shouldPrintBorderVertical(idx: number, backside = false): boolean {
    if (!this._dim) {
      return false;
    }
    if (!backside) {
      return idx < this._dim.rows;
    } else {
      return idx >= (this._dim.cols - 1) * this._dim.rows;
    }
  }

  shouldPrintBorderHorizontal(idx: number): boolean {
    if (!this._dim) {
      return false;
    }
    return idx % this._dim.rows === 0;
  }

  @Input()
  set pageLayout(dim: IPageLayout) {
    this._dim = dim;
    this.initColsAndRows();
  }

  private initColsAndRows() {
    if (this._setup && this._dim) {
      const width = LabelService.widthOuter(this._setup.label) + 'mm';
      const height = LabelService.heightOuter(this._setup.label) + 'mm';
      this.cols = Array(this._dim.cols).fill(width).join(' ');
      this.rows = Array(this._dim.rows).fill(height).join(' ');
    }
  }

}

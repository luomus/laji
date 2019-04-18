import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IPageStyle, ISetup } from '../../generic-label-maker.interface';
import { IPageLayout } from '../../label.service';

@Component({
  selector: 'll-label-page',
  templateUrl: './label-page.component.html',
  styleUrls: ['../../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelPageComponent implements AfterViewInit {

  @Input() data: object[];
  @Output() ready = new EventEmitter<void>();

  cols = '';
  rows = '';
  backStyle: IPageStyle;
  private _setup: ISetup;

  constructor() { }

  @Input() set setup(val: ISetup) {
    this._setup = val;
    if (val.twoSided) {
      const style = {...val.page};
      const swp = style['paddingLeft.mm'];
      style['paddingLeft.mm'] = style['paddingRight.mm'];
      style['paddingRight.mm'] = swp;
      this.backStyle = style;
    }
  }

  get setup() {
    return this._setup;
  }

  ngAfterViewInit() {
    // QRCodes will not be included if there is no setTimeout here
    setTimeout(() => {
      this.ready.emit();
    });
  }

  @Input()
  set pageLayout(dim: IPageLayout) {
    this.cols = Array(dim.cols).fill('1fr').join(' ');
    this.rows = Array(dim.rows).fill('1fr').join(' ');
  }

}

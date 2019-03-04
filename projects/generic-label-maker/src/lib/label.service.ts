import { Injectable } from '@angular/core';
import { ISetup, ILabelStyle } from './generic-label-maker.interface';

export interface PageLayout {
  cols: number;
  rows: number;
}

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  private pixelToMMRation;

  public static widthInner(style: ILabelStyle) {
    return style['width.mm'] - ((style['paddingRight.mm'] || 0) + (style['paddingLeft.mm'] || 0));
  }

  public static heightInner(style: ILabelStyle) {
    return style['height.mm'] - ((style['paddingTop.mm'] || 0) + (style['paddingBottom.mm'] || 0));
  }

  public static widthOuter(style: ILabelStyle) {
    return style['width.mm'] + ((style['marginRight.mm'] || 0) + (style['marginLeft.mm'] || 0));
  }

  public static heightOuter(style: ILabelStyle) {
    return style['height.mm'] + ((style['marginTop.mm'] || 0) + (style['marginBottom.mm'] || 0));
  }

  constructor() {}

  public countLabelsPerPage(setup: ISetup): PageLayout {
    const pageWidth = LabelService.widthInner(setup.page);
    const pageHeight = LabelService.heightInner(setup.page);
    const labelWidth = LabelService.widthOuter(setup.label);
    const labelHeight = LabelService.heightOuter(setup.label);

    return {
      cols: Math.floor(pageWidth / labelWidth),
      rows: Math.floor(pageHeight / labelHeight)
    };
  }

  public pixelToMm(pixels: number) {
    return pixels / this.pixelToMMRation;
  }

  public mmToPixel(mm: number) {
    return mm * this.pixelToMMRation;
  }

  public initPixelMMRatio(elem100mmHigh: HTMLDivElement) {
    if (this.pixelToMMRation) {
      return;
    }
    this.pixelToMMRation = elem100mmHigh.offsetHeight / 100;
  }

  public hasRation() {
    return !!this.pixelToMMRation;
  }

  public hasValue(data: object, field: string) {
    return !(typeof data[field] === 'undefined' || data[field] === '');
  }

  public countMinLabelSize(setup: ISetup): {width: number, height: number} {
    let width = 0, height = 0;

    const max = (item => {
      if (item.x + item.style['width.mm'] > width) {
        width = item.x + item.style['width.mm'];
      }
      if (item.y + item.style['height.mm'] > height) {
        height = item.y + item.style['height.mm'];
      }
    });

    setup.labelItems.forEach(max);
    setup.backSideLabelItems.forEach(max);

    return {width, height};
  }

}

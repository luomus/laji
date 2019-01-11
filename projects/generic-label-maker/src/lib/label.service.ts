import { Injectable } from '@angular/core';
import { Setup } from './generic-label-maker.interface';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  private pixelToMMRation;

  constructor() {}

  public countLabelsPerPage(setup: Setup): {cols: number, rows: number} {
    const pageWidth = setup.page['width.mm'] - ((setup.page['paddingRight.mm'] || 0) + (setup.page['paddingLeft.mm'] || 0));
    const pageHeight = setup.page['height.mm'] - ((setup.page['paddingTop.mm'] || 0) + (setup.page['paddingBottom.mm'] || 0));
    const labelWidth = setup.label['width.mm'] + ((setup.label['marginRight.mm'] || 0) + (setup.label['marginLeft.mm'] || 0));
    const labelHeight = setup.label['height.mm'] + ((setup.label['marginTop.mm'] || 0) + (setup.label['marginBottom.mm'] || 0));

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

}

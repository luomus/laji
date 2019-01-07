import { Injectable } from '@angular/core';
import { Setup } from './generic-label-maker.interface';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  public static EmptySetup: Setup = {
    page: {
      height: 297,
      width: 210,
      margin: {
        top: 10,
        left: 10
      }
    },
    label: {
      height: 20,
      width: 50,
      margin: {
        top: 3,
        left: 3
      }
    },
    labelItems: []
  };

  private pixelToMMRation;

  constructor() {}


  public pixelToMm(pixels: number) {
    return Math.floor(pixels / this.pixelToMMRation);
  }

  public mmToPixel(mm: number) {
    return Math.floor(mm * this.pixelToMMRation);
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

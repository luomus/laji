import { IPageStyle } from './generic-label-maker.interface';

export class Presets {

  public static A4: IPageStyle = {
    'height.mm': 297,
    'width.mm': 210
  };

  public static A4Landscape: IPageStyle = {
    'height.mm': 210,
    'width.mm': 297
  };
}

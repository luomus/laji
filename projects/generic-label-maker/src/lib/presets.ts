import { Setup } from './generic-label-maker.interface';

export class Presets {

  public static A4: Setup = {
    page: {
      'height.mm': 297,
      'width.mm': 210,
      'paddingTop.mm': 10,
      'paddingLeft.mm': 10,
      'paddingBottom.mm': 10,
      'paddingRight.mm': 10,
      'font-size.pt': 6
    },
    label: {
      'height.mm': 20,
      'width.mm': 50,
      'marginTop.mm': 1.5,
      'marginLeft.mm': 1.5,
      'marginBottom.mm': 1.5,
      'marginRight.mm': 2.5,
      'font-size.pt': 10
    },
    labelItems: []
  };
}

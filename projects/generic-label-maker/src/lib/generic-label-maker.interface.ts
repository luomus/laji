export interface IFontStyle {
  'font-family'?: string;
  'font-size.pt'?: number;
  'font-weight'?: string;
  'font-style'?: string;
  'text-decoration'?: string;
  'text-align'?: string;
  'line-height'?: string;
}

export interface IPageStyle extends IFontStyle {
  'height.mm'?: number;
  'width.mm'?: number;
  'paddingTop.mm'?: number;
  'paddingLeft.mm'?: number;
  'paddingBottom.mm'?: number;
  'paddingRight.mm'?: number;
}

export interface ILabelStyle extends IFontStyle {
  'height.mm'?: number;
  'width.mm'?: number;
  'marginTop.mm'?: number;
  'marginLeft.mm'?: number;
  'marginBottom.mm'?: number;
  'marginRight.mm'?: number;
  'top.mm'?: number;
  'left.mm'?: number;
}

export interface LabelItem {
  _id?: number;
  x: number; // x position in mm
  y: number; // y position in mm
  type: string;
  fields: LabelField[];
  style?: ILabelStyle;
  order?: number;
}

export interface LabelField {
  field: string;
  label: string;
  content?: string;
  separator?: string;
  includeLabel?: boolean;
  type?: 'qr-code'|'text';
  style?: IFontStyle;
}

export interface Setup {

  /**
   * Pages size object
   */
  page: IPageStyle;


  /**
   * Labels size object
   */
  label: ILabelStyle;

  /**
   * Items on the label
   */
  labelItems: LabelItem[];
}

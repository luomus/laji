export type TLabelLocation = 'labelItems' | 'backSideLabelItems';

export enum FieldType {
  qrCode = 'qr-code',
  id = 'id',
  text = 'text'
}

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

export interface ILabelItem {
  _id?: number;
  x: number; // x position in mm
  y: number; // y position in mm
  type: string;
  fields: ILabelField[];
  style?: ILabelStyle;
  order?: number;
}

export interface ILabelField {
  field: string;
  label: string;
  prefix?: string;
  suffix?: string;
  join?: string;
  content?: string;
  separator?: string;
  separatorAlways?: boolean;
  isArray?: boolean;
  type?: FieldType;
  style?: IFontStyle;
  styleAppliesTo?: 'content'|'prefix'|'suffix'|'all'|'contentPrefix'|'contentSuffix'|'prefixSuffix';
  _menuOpen?: boolean;
  valueMap?: {[from: string]: string};
}

export interface IViewSettings {
  magnification: number;
  grid?: number;
  gridVisible?: boolean;
  fullscreen?: boolean;
}

export interface ISetup {

  version?: number;

  /**
   * Pages size object
   */
  page: IPageStyle;

  /**
   * true - print odd pages using labelItems and even pages using backSideLabelItems
   * false - print all pages using labelItems
   */
  twoSided?: boolean;

  /**
   * Skip this many items from the start
   */
  skip?: number;

  /**
   * Labels size object
   */
  label: ILabelStyle;

  /**
   * Items on the label
   */
  labelItems: ILabelItem[];

  /**
   * Label items on the back side
   */
  backSideLabelItems?: ILabelItem[];

  border?: string;

  /**
   * Map values to new one
   */
  valueMap?: ILabelValueMap;
}

export interface IAddLabelEvent {
  item: ILabelItem;
  location: TLabelLocation;
}

export interface ILabelValueMap {
  [field: string]: {
    [value: string]: string
  };
}

export interface Style {
  'height.mm'?: number;
  'width.mm'?: number;
  'marginTop.mm'?: number;
  'marginLeft.mm'?: number;
  'marginBottom.mm'?: number;
  'marginRight.mm'?: number;
  'paddingTop.mm'?: number;
  'paddingLeft.mm'?: number;
  'paddingBottom.mm'?: number;
  'paddingRight.mm'?: number;
  'font-size.pt'?: number;
  'top.mm'?: number;
  'left.mm'?: number;
}

export interface LabelItem {
  x: number;
  y: number;
  type: string;
  fields: LabelField[];
  style?: Style;
  order?: number;
}

export interface LabelItemSelectAction {
  item: LabelItem;
  index: number;
}

export interface LabelField {
  field: string;
  label: string;
  content?: string;
  separator?: string;
  includeLabel?: boolean;
  isQRCode?: boolean;
  style?: Style;
}

export interface Setup {

  /**
   * Pages size object
   */
  page: Style;


  /**
   * Labels size object
   */
  label: Style;

  /**
   * Items on the label
   */
  labelItems: LabelItem[];
}

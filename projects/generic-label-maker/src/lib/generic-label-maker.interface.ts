interface Margin {
  /**
   * Top margin in mm
   */
  top?: number;

  /**
   * Left margin in mm
   */
  right?: number;

  /**
   * Bottom margin in mm
   */
  bottom?: number;


  /**
   * Left margin in mm
   */
  left?: number;
}

interface Font {
  face?: string;
  size?: string;
  'line-height'?: number;
}

export interface Size {

  /**
   * Width of the page in mm
   */
  width: number;

  /**
   * Height of the page in mm
   */
  height: number;

  /**
   * Page margins in mm
   */
  margin?: Margin;

}

export interface LabelItem extends Size {
  x: number;
  y: number;
  type: string;
  fields: LabelField[];
  font?: Font;
  order?: number;
}

export interface LabelItemSelectAction {
  item: LabelItem;
  index: number;
}

export interface LabelField {
  field: string;
  label: string;
  exampleTxt?: string;
  separator?: string;
  includeLabel?: boolean;
  isQRCode?: boolean;
  font?: Font;
}

export interface Label extends Size {
  items: LabelItem[];
}

export interface Setup {

  /**
   * Pages size object
   */
  page: Size;


  /**
   * Labels size object
   */
  label: Size;

  /**
   * Items on the label
   */
  labelItems: LabelItem[];
}

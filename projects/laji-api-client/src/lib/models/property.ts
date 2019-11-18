/* tslint:disable */
export interface Property {

  /**
   * min occurrence
   */
  minOccurs?: string;

  /**
   * property name
   */
  property?: string;

  /**
   * label for the property
   */
  label?: string;

  /**
   * comment for the property
   */
  comment?: string;
  range: Array<string>;
  domain: Array<string>;

  /**
   * short property name
   */
  shortName?: string;

  /**
   * max occurrence
   */
  maxOccurs?: string;

  /**
   * is required (interpreted from occurrence fields)
   */
  required?: boolean;

  /**
   * is an array (interpreted from occurrence fields)
   */
  hasMany?: boolean;

  /**
   * has multiple languages
   */
  multiLang?: boolean;

  /**
   * range object can be embedded
   */
  embedded?: boolean;

  /**
   * Property position in the class
   */
  sortOrder?: number;
}

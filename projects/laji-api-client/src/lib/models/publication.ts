/* tslint:disable */
export interface Publication {
  id: string;
  dc:URI?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  'dc:bibliographicCitation'?: string;
  doi?: string;

  /**
   * International Standard Book Number
   */
  isbn?: string;
}

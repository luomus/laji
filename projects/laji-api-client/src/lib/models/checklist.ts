/* tslint:disable */
export interface Checklist {
  id: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  'dc:bibliographicCitation'?: string;
  isPublic?: boolean;
  owner?: string;
  rootTaxon?: string;
}

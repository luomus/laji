/* tslint:disable */
export interface RedListEvaluationGroup {
  id: string;
  hasIucnSubGroup?: Array<string>;
  includesInformalTaxonGroup?: Array<string>;
  includesTaxon?: Array<string>;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  name?: string;
}

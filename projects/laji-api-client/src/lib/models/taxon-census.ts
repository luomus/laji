/* tslint:disable */
export interface TaxonCensus {

  /**
   * QName for MX.taxon
   */
  censusTaxonID: string;
  taxonCensusType: 'MY.taxonCensusTypeCounted' | 'MY.taxonCensusTypeEstimated' | 'MY.taxonCensusTypeNotCounted' | 'MY.taxonCensusTypeUHEXCounted' | 'MY.taxonCensusTypeUHEXNotCounted';
}

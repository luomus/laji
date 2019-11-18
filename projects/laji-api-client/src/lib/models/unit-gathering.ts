/* tslint:disable */
export interface UnitGathering {

  /**
   * QName for MZ.geometry
   */
  geometry?: string;

  /**
   * Context for the given json
   */
  '@context'?: string;
  coordinatesGridYKJ?: string;
  dateBegin?: string;
  dateEnd?: string;

  /**
   * This field is automatically populated with the objects type and any user given value in here will be ignored!
   */
  '@type'?: string;

  /**
   * Informal description of the habitat.
   */
  habitatDescription?: string;
  habitatIUCN?: string;

  /**
   * Unique ID for the object. This will be automatically generated.
   */
  id?: string;

  /**
   * Type of substrate or name of substrate species.
   */
  substrate?: string;

  /**
   * QName for MX.taxon
   */
  substrateSpeciesID?: string;
}

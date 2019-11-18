/* tslint:disable */
export interface Area {
  id: string;

  /**
   * Aluetyyppi
   */
  areaType?: 'ML.country' | 'ML.biogeographicalProvince' | 'ML.municipality' | 'ML.oldMunicipality' | 'ML.iucnEvaluationArea' | 'ML.birdAssociationArea';

  /**
   * Country code ISO alpha 2
   */
  countryCodeISOalpha2?: string;

  /**
   * country code ISO alpha 3
   */
  countryCodeISOalpha3?: string;
  isPartOf?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  name?: string;

  /**
   * If lang parameter is 'multi' this will be a lang object instead of a string or an array of strings!
   */
  provinceCodeAlpha?: string;
  provinceCodeNumeric?: string;
}

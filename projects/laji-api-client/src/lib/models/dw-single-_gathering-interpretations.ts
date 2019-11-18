/* tslint:disable */
export interface DwSingle_GatheringInterpretations {
  sourceOfBiogeographicalProvince?: 'COORDINATES' | 'COORDINATE_CENTERPOINT' | 'REPORTED_VALUE' | 'FINNISH_MUNICIPALITY' | 'OLD_FINNISH_MUNICIPALITY';
  coordinateAccuracy?: number;
  countryDisplayname?: string;
  biogeographicalProvinceDisplayname?: string;
  municipalityDisplayname?: string;
  sourceOfCountry?: 'COORDINATES' | 'COORDINATE_CENTERPOINT' | 'REPORTED_VALUE' | 'FINNISH_MUNICIPALITY' | 'OLD_FINNISH_MUNICIPALITY';
  sourceOfCoordinates?: 'COORDINATES' | 'COORDINATE_CENTERPOINT' | 'REPORTED_VALUE' | 'FINNISH_MUNICIPALITY' | 'OLD_FINNISH_MUNICIPALITY';
  sourceOfFinnishMunicipality?: 'COORDINATES' | 'COORDINATE_CENTERPOINT' | 'REPORTED_VALUE' | 'FINNISH_MUNICIPALITY' | 'OLD_FINNISH_MUNICIPALITY';
  biogeographicalProvince?: string;
  biogeographicalProvinces?: Array<string>;
  country?: string;
  finnishMunicipalities?: Array<string>;
  finnishMunicipality?: string;
}

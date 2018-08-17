export interface ObservationFormQuery {
  taxon: string;
  taxonIncludeLower: boolean;
  taxonUseAnnotated: boolean;
  timeStart: string;
  timeEnd: string;
  informalTaxonGroupId: string;
  hasNotMedia: boolean;
  isNotFinnish: boolean;
  isNotInvasive: boolean;
  includeOnlyValid: boolean;
  nationallySignificantInvasiveSpecies: boolean;
  euInvasiveSpeciesList: boolean;
  quarantinePlantPest: boolean;
  otherInvasiveSpeciesList: boolean;
  nationalInvasiveSpeciesStrategy: boolean;
  allInvasiveSpecies: boolean;
  onlyFromCollectionSystems: boolean;
  asObserver: boolean;
  asEditor: boolean;
}

export interface ObservationFormQuery {
  taxon: string;
  taxonIncludeLower: boolean;
  taxonUseAnnotated: boolean;
  timeStart: string;
  timeEnd: string;
  informalTaxonGroupId: string;
  includeOnlyValid: boolean;
  nationallySignificantInvasiveSpecies: boolean;
  euInvasiveSpeciesList: boolean;
  quarantinePlantPest: boolean;
  otherInvasiveSpeciesList: boolean;
  nationalInvasiveSpeciesStrategy: boolean;
  controllingRisksOfInvasiveAlienSpecies: boolean;
  allInvasiveSpecies: boolean;
  onlyFromCollectionSystems: boolean;
  asObserver: boolean;
  asEditor: boolean;
  asNotEditorOrObserver: boolean;
  coordinatesInSource: boolean;
}

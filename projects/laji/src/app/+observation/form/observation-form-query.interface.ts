export interface ObservationFormQuery {
  taxon: string;
  taxonIncludeLower: boolean;
  taxonUseAnnotated: boolean;
  timeStart: string;
  timeEnd: string;
  informalTaxonGroupId: string;
  includeOnlyValid: boolean;
  euInvasiveSpeciesList: boolean;
  controllingRisksOfInvasiveAlienSpeciesGovernment: boolean;
  quarantinePlantPest: boolean;
  qualityPlantPest: boolean;
  otherPlantPest: boolean;
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

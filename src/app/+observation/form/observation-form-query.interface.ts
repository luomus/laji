export interface ObservationFormQuery {
  taxon: string;
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
  zeroObservations: boolean;
  onlyPreservedSpecimen: boolean;
}

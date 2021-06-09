export interface SpeciesFormQuery {
  taxon?: string;
  onlyFinnish: boolean;
  onlyInvasive: boolean;
  onlyNonInvasive: boolean;
  euInvasiveSpeciesList: boolean;
  controllingRisksOfInvasiveAlienSpecies: boolean;
  quarantinePlantPest: boolean;
  qualityPlantPest: boolean;
  otherPlantPest: boolean;
  nationalInvasiveSpeciesStrategy: boolean;
  otherInvasiveSpeciesList: boolean;
  allInvasiveSpecies: boolean;
}

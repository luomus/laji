export interface SpeciesFormQuery {
  taxon?: string;
  onlyFinnish: boolean;
  onlyInvasive: boolean;
  onlyNonInvasive: boolean;
  euInvasiveSpeciesList: boolean;
  nationallySignificantInvasiveSpecies: boolean;
  controllingRisksOfInvasiveAlienSpecies: boolean;
  quarantinePlantPest: boolean;
  allInvasiveSpecies: boolean;
}

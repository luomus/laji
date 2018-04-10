export interface SpeciesFormQuery {
  taxon?: string;
  onlyFinnish?: boolean;
  onlyInvasive?: boolean;
  onlyNonInvasive?: boolean;
  euInvasiveSpeciesList?: boolean,
  nationallySignificantInvasiveSpecies?: boolean,
  quarantinePlantPest?: boolean,
  allInvasiveSpecies?: boolean
}

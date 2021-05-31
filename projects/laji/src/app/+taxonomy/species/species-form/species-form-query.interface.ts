export interface SpeciesFormQuery {
  taxon?: string;
  'onlyFinnish': boolean;
  'onlyInvasive': boolean;
  'onlyNonInvasive': boolean;
  'MX.euInvasiveSpeciesList': boolean;
  'MX.controllingRisksOfInvasiveAlienSpecies': boolean;
  'MX.quarantinePlantPest': boolean;
  'MX.qualityPlantPest': boolean;
  'MX.otherPlantPest': boolean;
  'MX.nationalInvasiveSpeciesStrategy': boolean;
  'MX.otherInvasiveSpeciesList': boolean;
  'allInvasiveSpecies': boolean;
}

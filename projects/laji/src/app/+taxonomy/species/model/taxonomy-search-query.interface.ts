export interface TaxonomySearchQueryInterface {
  informalGroupFilters?: string;
  target?: string;
  onlyFinnish?: boolean;
  invasiveSpeciesFilter?: boolean;
  redListStatusFilters?: string[];
  adminStatusFilters?: string[];
  typesOfOccurrenceFilters?: string[];
  typesOfOccurrenceNotFilters?: string[];
  taxonRanks?: string[];
  primaryHabitat?: string[];
  anyHabitat?: string[];
}

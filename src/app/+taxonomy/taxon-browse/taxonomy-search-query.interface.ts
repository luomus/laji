export interface TaxonomySearchQueryInterface {
  informalTaxonGroupId?: string;
  target?: string;
  onlyFinnish?: boolean;
  invasiveSpeciesFilter?: boolean;
  redListStatusFilters?: string[];
  adminStatusFilters?: string[];
  typesOfOccurrenceFilters?: string[];
  typesOfNotOccurrenceFilters?: string[];
}

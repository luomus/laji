export interface IKerttuSpeciesQuery {
  onlyUnvalidated?: boolean;
  continent?: string;
  country?: string;
  order?: string;
  family?: string;
}

export interface IKerttuTaxon {
  id: number;
  scientificName: string;
  commonName: string;
}

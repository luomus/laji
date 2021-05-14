export interface IKerttuSpeciesQuery {
  onlyUnvalidated?: boolean;
  continent?: number;
  // country?: string;
  order?: number;
  family?: number;
  page?: number;
  orderBy?: string[];
}

export interface IKerttuSpecies {
  id: number;
  scientificName: string;
  commonName: string;
}

export interface IKerttuSpeciesFilters {
  continent: {id: number, name: string}[];
  order: {id: number, scientificName: string}[];
  family: {id: number, scientificName: string, order: number}[];
}

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

export interface IKerttuRecording {
  id: number;
  audio: IGlobalAudio;
  xRange: number[];
  yRange: number[];
}

export interface IGlobalAudio {
  url: string;
  species: IKerttuSpecies;
  recordist?: string;
  country?: string;
  state?: string;
  year?: number;
  month?: number;
  day?: number;
  assetId: string;
  specimenUrl: string;
  checklistId?: string;
  checklistUrl?: string;
}

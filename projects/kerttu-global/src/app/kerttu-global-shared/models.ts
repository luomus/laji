import { IAudio, IAudioViewerArea } from 'projects/laji/src/app/shared-modules/audio-viewer/models';

export interface IListResult<T> {
  results: T[];
}

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
  userValidations: number;
  userHasValidated: boolean;
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

export interface IGlobalAudio extends IAudio {
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

export interface ILetterAnnotation {
  annotation?: LetterAnnotation;
  area?: IAudioViewerArea;
  notes?: string;
}

export interface IValidationStat {
  validationCount: number;
  count: number;
}

export interface IUserStat {
  userId: string;
  count: number;
}

export enum LetterAnnotation {
  yes = 1,
  no = 0,
  unsure = -1
}

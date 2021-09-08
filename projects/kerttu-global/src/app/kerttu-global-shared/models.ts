import { IAudio, IAudioViewerArea } from 'projects/laji/src/app/shared-modules/audio-viewer/models';

export interface IListResult<T> {
  results: T[];
}

export interface SuccessResult {
  success: true;
}

export interface IKerttuSpeciesQuery {
  onlyUnvalidated?: boolean;
  continent?: number;
  order?: number;
  family?: number;
  searchQuery?: string;
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
  audio: IGlobalAudio;
  candidates?: IAudioViewerArea[];
}

export interface IKerttuLetterTemplate {
  audioId: number;
  area: IAudioViewerArea;
}

export interface IGlobalAudio extends IAudio {
  id: number;
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

export interface IValidationStat {
  validationCount: number;
  count: number;
}

export interface IUserStat {
  userId: string;
  count: number;
}

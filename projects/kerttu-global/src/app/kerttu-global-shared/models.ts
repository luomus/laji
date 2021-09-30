import { IAudio, IAudioViewerArea } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';

export interface IListResult<T> {
  results: T[];
}

export interface SuccessResult {
  success: true;
}

export interface IGlobalSpeciesListResult extends PagedResult<IGlobalSpecies> {
  hasModifications?: boolean;
}

export interface IGlobalSpeciesQuery {
  onlyUnvalidated?: boolean;
  continent?: number;
  order?: number;
  family?: number;
  searchQuery?: string;
  page?: number;
  orderBy?: string[];
}

export interface IGlobalSpecies {
  id: number;
  scientificName: string;
  commonName: string;
  versionCount?: number;
  validationCount?: number;
  userHasValidated?: boolean;
  hasModifications?: boolean;
  isLocked?: boolean;
}

export interface IGlobalSpeciesFilters {
  continent: {id: number, name: string}[];
  order: {id: number, scientificName: string}[];
  family: {id: number, scientificName: string, order: number}[];
}

export interface IGlobalValidationData {
  created?: string;
  userId?: string;
  templates: IGlobalTemplate[];
}

export interface IGlobalRecording {
  audio: IGlobalAudio;
  candidates?: IAudioViewerArea[];
}

export interface IGlobalTemplate {
  id?: number;
  audioId: number;
  area: IAudioViewerArea;
  comment?: IGlobalComment;
  validatedBy?: string[];
}

export interface IGlobalComment {
  created?: string;
  userId?: string;
  templateId: number;
  type: CommentType;
  comment: string;
}

export interface IGlobalAudio extends IAudio {
  id: number;
  species: IGlobalSpecies;
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

export enum CommentType {
  replace = 0,
  reframe = 1
}

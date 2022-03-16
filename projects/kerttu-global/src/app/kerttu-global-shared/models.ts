import { IAudio, IAudioViewerArea } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { Point } from 'geojson';

export interface IListResult<T> {
  results: T[];
}

export interface ISuccessResult {
  success: boolean;
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
  pageSize?: number;
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
  hasNotPossibleValidations?: boolean;
  isSpecies?: boolean;
  taxonOrder?: number;
}

export interface IGlobalSpeciesFilters {
  continent: { id: number, name: string }[];
  order: { id: number, scientificName: string }[];
  family: { id: number, scientificName: string, order: number }[];
}

export interface IGlobalTemplateVersion {
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
  speciesCreated: number;
  speciesValidated: number;
}

export interface IGlobalRecording extends IAudio {
  id: number;
  dateTime: string;
  site: IGlobalSite;
}

export interface IGlobalRecordingAnnotation {
  isLowQuality?: boolean;
  containsHumanSpeech?: boolean;
  containsUnknownBirds?: boolean;
  doesNotContainBirds?: boolean;
  containsBirdsNotOnList?: boolean;
  birdsNotOnList?: string;
  nonBirdArea?: IAudioViewerArea;

  speciesAnnotations?: IGlobalSpeciesAnnotation[];
}

export interface IGlobalSpeciesAnnotation {
  speciesId: number;
  occurrence: SpeciesAnnotationEnum;
  area?: IAudioViewerArea;
}

export interface IGlobalRecordingStatusInfo {
  hasPreviousRecording: boolean;
}

export interface IGlobalRecordingResponse {
  statusInfo: IGlobalRecordingStatusInfo;
  annotation: IGlobalRecordingAnnotation;
  recording: IGlobalRecording;
}

export interface IGlobalSpeciesWithAnnotation extends IGlobalSpecies {
  annotation: IGlobalSpeciesAnnotation;
}

export interface IGlobalSite {
  id: number,
  name: string;
  country?: string;
  geometry: Point;
}

export interface IIdentificationSiteStat {
  siteId: number;
  count: number;
}

export interface IIdentificationStat {
  annotationCount: number;
  speciesCount: number;
  drawnBoxesCount: number;
}

export interface IIdentificationUserStat extends IIdentificationStat {
  userId: string;
}


export enum CommentType {
  replace = 0,
  reframe = 1
}

export enum SpeciesAnnotationEnum {
  occurs = 1,
  possible_occurs = 2
}

export enum KerttuGlobalErrorEnum {
  speciesLocked = 'SpeciesLockedError',
  invalidRecordingId = 'InvalidRecordingIdError',
  invalidRecordingAnnotation = 'InvalidRecordingAnnotationError'
}

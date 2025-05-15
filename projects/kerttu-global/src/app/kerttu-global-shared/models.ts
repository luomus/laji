import {
  Audio,
  AudioViewerArea,
  AudioViewerRectangle, AudioViewerRectangleGroup
} from 'projects/laji/src/app/shared-modules/audio-viewer/models';
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
  includeSpeciesWithoutAudio?: boolean;
  taxonType?: TaxonTypeEnum;
}

export interface IGlobalSpecies {
  id: number;
  scientificName: string;
  commonName?: string;
  versionCount?: number;
  validationCount?: number;
  userHasValidated?: boolean;
  hasModifications?: boolean;
  isLocked?: boolean;
  hasNotPossibleValidations?: boolean;
  isSpecies?: boolean;
  taxonOrder?: number;
  hasAudio?: boolean;
}

export interface IGlobalSpeciesFilters {
  continent: { id: number; name: string }[];
  order: { id: number; scientificName: string }[];
  family: { id: number; scientificName: string; order: number }[];
}

export interface IGlobalTemplateVersion {
  created?: string;
  userId?: string;
  templates: IGlobalTemplate[];
}

export interface IGlobalRecording {
  audio: IGlobalAudio;
  candidates: AudioViewerArea[];
}

export interface IGlobalTemplate {
  id?: number;
  audioId: number;
  area: AudioViewerArea;
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

export interface IGlobalAudio extends Audio {
  id: number;
  species: IGlobalSpecies;
  recordist?: string;
  country?: string;
  state?: string;
  location?: string;
  year?: number;
  month?: number;
  day?: number;
  assetId: string;
  specimenUrl: string;
  checklistId?: string;
  checklistUrl?: string;
  licenseUrl?: string;
  soundType?: string;
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

export interface IGlobalRecording extends Audio {
  id: number;
  dateTime: string;
  xRange: number[];
  site: IGlobalSite;
  locality?: string;
  targetSpecies?: IGlobalSpecies;
  taxonType: TaxonTypeEnum;
}

export interface IGlobalRecordingAnnotation {
  isLowQuality?: boolean;
  containsHumanSpeech?: boolean;
  containsUnknownBirds?: boolean;
  doesNotContainBirds?: boolean;
  containsBirdsNotOnList?: boolean;
  birdsNotOnList?: string;
  hasBoxesForAllBirdSounds?: boolean;
  nonBirdArea?: AudioViewerArea;

  speciesAnnotations?: IGlobalSpeciesAnnotation[];
}

export interface IGlobalSpeciesAnnotation {
  speciesId: number;
  occurrence: SpeciesAnnotationEnum;
  soundType?: SoundTypeEnum;
  boxes?: (IGlobalSpeciesAnnotationBox|IGlobalSpeciesAnnotationBoxGroup)[];
}

export interface IGlobalSpeciesAnnotationBox {
  area: AudioViewerArea;
  overlapsWithOtherSpecies?: boolean;
}

export interface IGlobalSpeciesAnnotationBoxGroup {
  boxes: IGlobalSpeciesAnnotationBox[];
}

export interface IGlobalRecordingWithAnnotation {
  recording: IGlobalRecording;
  annotation: IGlobalRecordingAnnotation;
}

export interface IGlobalSpeciesWithAnnotation extends IGlobalSpecies {
  annotation: IGlobalSpeciesAnnotation;
}

export interface IGlobalSite {
  id: number;
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
  distinctSpeciesCount: number;
  drawnBoxesCount: number;
}

export interface IIdentificationUserStat extends IIdentificationStat {
  userId: string;
}

export interface IIdentificationUserStatResult extends IListResult<IIdentificationUserStat> {
  totalDistinctSpeciesCount: number;
}

export interface IIdentificationSpeciesStat extends IGlobalSpecies {
  count: number;
  drawnBoxesCount: number;
}

export interface IIdentificationHistoryQuery {
  page?: number;
  pageSize?: number;
  orderBy?: string[];
  speciesSearchQuery?: string;
  includeSkipped?: boolean;
  site?: number;
}

export interface IIdentificationHistoryResponse {
  recording: {
    id: number;
    site: IGlobalSite;
  };
  annotation: {
    created: string;
    species: IGlobalSpecies[];
    status: AnnotationStatusEnum;
  };
}

export enum CommentType {
  replace = 0,
  reframe = 1
}

export enum SpeciesAnnotationEnum {
  occurs = 1,
  possiblyOccurs = 2
}

export enum SoundTypeEnum {
  songOrDisplay = 1,
  other = 2
}

export enum KerttuGlobalErrorEnum {
  speciesLocked = 'SpeciesLockedError',
  invalidRecordingId = 'InvalidRecordingIdError',
  invalidRecordingAnnotation = 'InvalidRecordingAnnotationError'
}

export enum TaxonTypeEnum {
  bird = 0,
  bat = 1,
  insect = 2,
  frog = 3
}

export enum AnnotationStatusEnum {
  skipped = -1,
  notReady = 0,
  ready = 1
}

export function isBoxGroup(box: IGlobalSpeciesAnnotationBox|IGlobalSpeciesAnnotationBoxGroup): box is IGlobalSpeciesAnnotationBoxGroup {
  return !!(box as any).boxes;
}

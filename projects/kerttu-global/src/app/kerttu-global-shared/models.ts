import {
  Audio,
  AudioViewerArea
} from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { Point } from 'geojson';

export interface ListResult<T> {
  results: T[];
}

export interface SuccessResult {
  success: boolean;
}

export interface SpeciesListResult extends PagedResult<Species> {
  hasModifications?: boolean;
  unknownSpeciesRecordingCount?: number;
}

export interface SpeciesQuery {
  onlyUnvalidated?: boolean;
  onlyWithValidationAudio?: boolean;
  onlyWithSoundscapeRecordings?: boolean;
  soundscapeSites?: number[];
  includeValidationStatus?: boolean;
  includeAnnotationStatus?: boolean;
  continent?: number;
  order?: number;
  family?: number;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string[];
  taxonTypes?: TaxonTypeEnum[];
  taxonomyList?: TaxonomyListEnum;
}

export interface Species {
  id: number;
  scientificName: string;
  commonName?: string;
  taxonType: TaxonTypeEnum;
  taxonomyList: TaxonomyListEnum;
  versionCount?: number;
  validationCount?: number;
  userHasValidated?: boolean;
  hasModifications?: boolean;
  isLocked?: boolean;
  hasNotPossibleValidations?: boolean;
  recordingCount?: number;
  isSpecies?: boolean;
  taxonOrder?: number;
  hasAudio?: boolean;
}

export interface SpeciesFilters {
  continent: { id: number; name: string }[];
  order: { id: number; scientificName: string }[];
  family: { id: number; scientificName: string; order: number }[];
}

export interface TemplateVersion {
  created?: string;
  userId?: string;
  templates: Template[];
}

export interface ValidationAudioData {
  audio: ValidationAudio;
  candidates: AudioViewerArea[];
}

export interface Template {
  id?: number;
  audioId: number;
  area: AudioViewerArea;
  comment?: TemplateComment;
  validatedBy?: string[];
}

export interface TemplateComment {
  created?: string;
  userId?: string;
  templateId: number;
  type: CommentType;
  comment: string;
}

export interface ValidationAudio extends Audio {
  id: number;
  species: Species;
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

export interface ValidationCountStatistics {
  validationCount: number;
  count: number;
}

export interface ValidationUserStatistics {
  userId: string;
  speciesCreated: number;
  speciesValidated: number;
}

export interface Recording extends Audio {
  id: number;
  dateTime: string;
  xRange: number[];
  site: Site;
  locality?: string;
  targetSpecies?: Species;
  taxonType: TaxonTypeEnum;
}

export interface RecordingAnnotation {
  isLowQuality?: boolean;
  containsHumanSpeech?: boolean;
  containsUnknownBirds?: boolean;
  doesNotContainBirds?: boolean;
  containsBirdsNotOnList?: boolean;
  birdsNotOnList?: string;
  hasBoxesForAllBirdSounds?: boolean;
  nonBirdArea?: AudioViewerArea;

  speciesAnnotations?: SpeciesAnnotation[];
}

export interface SpeciesAnnotation {
  speciesId: number;
  occurrence: SpeciesAnnotationEnum;
  boxes?: (SpeciesAnnotationBox|SpeciesAnnotationBoxGroup)[];
}

export interface SpeciesAnnotationBox {
  area: AudioViewerArea;
  overlapsWithOtherSpecies?: boolean;
  soundType?: string;
}

export interface SpeciesAnnotationBoxGroup {
  boxes: SpeciesAnnotationBox[];
}

export interface RecordingWithAnnotation {
  recording: Recording;
  annotation: RecordingAnnotation;
}

export interface SpeciesWithAnnotation extends Species {
  annotation: SpeciesAnnotation;
}

export interface Site {
  id: number;
  name: string;
  country?: string;
  geometry: Point;
}

export interface SiteStatistics {
  siteId: number;
  count: number;
}

export interface IdentificationCountStatistics {
  annotationCount: number;
  speciesCount: number;
  distinctSpeciesCount: number;
  drawnBoxesCount: number;
}

export interface IdentificationUserStatistics extends IdentificationCountStatistics {
  userId: string;
}

export interface IdentificationUserStatisticsData extends ListResult<IdentificationUserStatistics> {
  totalDistinctSpeciesCount: number;
}

export interface IdentificationSpeciesStatistics extends Species {
  count: number;
  drawnBoxesCount: number;
}

export interface IdentificationHistoryQuery {
  page?: number;
  pageSize?: number;
  orderBy?: string[];
  speciesSearchQuery?: string;
  includeSkipped?: boolean;
  site?: number;
  taxonTypes?: TaxonTypeEnum[];
  hasBoxes?: boolean;
  exportedToXenoCanto?: boolean;
  taxonomyList?: TaxonomyListEnum;
}

export interface IdentificationHistoryResponse {
  recording: {
    id: number;
    xenoCantoId?: number;
    site: Site;
  };
  annotation: {
    created: string;
    species: IdentificationHistorySpecies[];
    status: AnnotationStatusEnum;
  };
}

export interface IdentificationHistorySpecies extends Species {
  boxCount?: number;
}

export interface XenoCantoScope {
  taxonCoverage: string;
  completeness: string;
}

export interface XenoCantoAnnotationSet {
  setName: string;
  setLicense: string;
  setCreator: string;
  setCreatorId?: string;
  setOwner: string;
  setSource?: string;
  setUri?: string;
  projectUri?: string;
  projectName?: string;
  funding?: string;
  setRemarks?: string;
  scope?: XenoCantoScope[];
}

export interface XenoCantoExportData {
  annotationSet: XenoCantoAnnotationSet;
  includeExported?: boolean;
}

export enum CommentType {
  replace = 0,
  reframe = 1
}

export enum SpeciesAnnotationEnum {
  occurs = 1,
  possiblyOccurs = 2
}

export enum KerttuGlobalErrorEnum {
  speciesLocked = 'SpeciesLockedError',
  invalidRecordingId = 'InvalidRecordingIdError',
  invalidRecordingAnnotation = 'InvalidRecordingAnnotationError',
  invalidXenoCantoApiKey = 'InvalidXenoCantoApiKeyError',
}

export enum TaxonTypeEnum {
  bird = 0,
  bat = 1,
  insect = 2,
  frog = 3,
  other = 4,
  mammal = 5
}

export enum AnnotationStatusEnum {
  skipped = -1,
  notReady = 0,
  ready = 1
}

export enum TaxonomyListEnum {
  default = 0,
  xenoCanto = 1
}

export function isBoxGroup(box: SpeciesAnnotationBox|SpeciesAnnotationBoxGroup): box is SpeciesAnnotationBoxGroup {
  return !!(box as any).boxes;
}

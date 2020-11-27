import {Taxonomy} from '../../shared/model/Taxonomy';

export interface IRecording {
  id: number;
  recording: string;
  xRange: number[];
}

interface  ILetter extends IRecording {
  yRange: number[];
}

export interface ILetterCandidate extends ILetter {
  crossCorrelation: number;
}

export interface ILetterTemplate extends ILetter {
  name: string;
  taxonId: string;
}

export interface ILetterStatusInfo {
  userAnnotationCount: number;
  targetAnnotationCount: number;
  hasPreviousCandidate: boolean;
}

export enum LetterAnnotation {
  yes = 1,
  no = 0,
  unsure = -1
}

export interface IRecordingAnnotation {
  isLowQuality?: boolean;
  containsNoiseCausedByHumanActivity?: boolean;
  containsHumanSpeech?: boolean;
  containsUnknownBirds?: boolean;
  doesNotContainBirds?: boolean;

  taxonAnnotations?: ITaxonAnnotations;
}

export interface ITaxonAnnotations {
  main?: ITaxonWithAnnotation[];
  other?: ITaxonWithAnnotation[];
}

export interface ITaxonAnnotation {
  taxonId: string;
  annotation: TaxonAnnotationEnum;
  bird: boolean;
}

export enum TaxonAnnotationEnum {
  occurs = 1,
  possible_occurs = 2
}

export interface ITaxonWithAnnotation extends Taxonomy {
  annotation: ITaxonAnnotation;
}

export interface IRecordingStatusInfo {
  hasPreviousRecording: boolean;
}

export enum KerttuErrorEnum {
  taxonExpertiseMissing = 'TaxonExpertiseMissingError',
  notEnoughLetterAnnotations = 'NotEnoughLetterAnnotationsError',
  invalidTemplateId = 'InvalidTemplateIdError',
  invalidCandidateId = 'InvalidCandidateIdError',
  invalidRecordingId = 'InvalidRecordingIdError',
  invalidRecordingAnnotation = 'InvalidRecordingAnnotationError'
}

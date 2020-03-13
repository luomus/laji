export enum Annotation {
  yes,
  no,
  maybe
}

export interface ILetterAnnotations {
  [templateId: string]: { [candidateId: string]: Annotation };
}

export interface IRecordingAnnotations {
  [audioId: string]: string[];
}

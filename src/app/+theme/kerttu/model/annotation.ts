export enum Annotation {
  yes,
  no,
  maybe
}

export interface ILetterAnnotations {
  [templateId: string]: { [candidateId: string]: Annotation };
}

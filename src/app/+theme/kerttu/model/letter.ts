interface ILetter {
  id: number;
  recording: string;
  xRange: number[];
}

export interface ILetterCandidate extends ILetter {
  crossCorrelation: number;
  yDiff: number;
}

export interface ILetterTemplate extends ILetter {
  name: string;
  taxonId: string;
  userAnnotationCount: number;
  annotationCountTarget: number;
  yRange: number[];
}

export enum LetterAnnotation {
  yes,
  no,
  unsure
}

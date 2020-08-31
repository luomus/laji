interface ILetter {
  id: number;
  recording: string;
  xRange: number[];
}

export interface ILetterStatusInfo {
  userAnnotationCount: number;
  targetAnnotationCount: number;
  hasPreviousCandidate: boolean;
}

export interface ILetterCandidate extends ILetter {
  crossCorrelation: number;
  yDiff: number;
}

export interface ILetterTemplate extends ILetter {
  name: string;
  taxonId: string;
  yRange: number[];
}

export enum LetterAnnotation {
  yes = 1,
  no = 0,
  unsure = -1
}

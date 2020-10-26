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

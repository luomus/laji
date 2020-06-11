interface ILetter {
  id: number;
  recording: string;
  xRange: number[];
  info: {
    userAnnotationCount: number;
    targetAnnotationCount: number
  };
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

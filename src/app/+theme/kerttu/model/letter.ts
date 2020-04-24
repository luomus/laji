export interface ILetter {
  id: number;
  recording: string;
  xRange: number[];
}

export interface ILetterTemplate extends ILetter {
  taxonId: string;
  yRange: number[];
}

export enum LetterAnnotation {
  yes,
  no,
  unsure
}

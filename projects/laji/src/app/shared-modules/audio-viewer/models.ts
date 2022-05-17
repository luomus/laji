export interface IAudio {
  url: string;
  spectrogramUrl?: string;
  duration?: number;
}

export interface ISpectrogramConfig {
  sampleRate: number;
  targetWindowLengthInSeconds: number;
  targetWindowOverlapPercentage: number;
  nbrOfRowsRemovedFromStart?: number;
  maxNbrOfColsForNoiseEstimation?: number;
  noiseReductionParam?: number;
  logRange?: number;
}

export interface IAudioViewerRectangle {
  area: IAudioViewerArea;
  color?: string;
  label?: string;
}

export interface IAudioViewerArea {
  xRange?: number[];
  yRange?: number[];
}

export type AudioViewerMode = 'default' | 'zoom' | 'draw';

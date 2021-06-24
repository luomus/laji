export interface IAudioViewerArea {
  xRange?: number[];
  yRange?: number[];
}

export interface ISpectrogramConfig {
  sampleRate: number;
  nperseg: number;
  noverlap: number;
  nbrOfRowsRemovedFromStart?: number;
  maxNbrOfColsForNoiseEstimation?: number;
  noiseReductionParam?: number;
  logRange?: number;
}

export type AudioViewerMode = 'default' | 'zoom' | 'draw';

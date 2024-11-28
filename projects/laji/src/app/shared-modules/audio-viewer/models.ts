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
  minFrequency?: number;
}

export interface IAudioViewerRectangle {
  area: IAudioViewerArea;
  color?: string;
  label?: string;
}

export interface IAudioViewerRectangleGroup {
  rectangles: IAudioViewerRectangle[];
  color?: string;
}

export interface IAudioViewerArea {
  xRange?: number[];
  yRange?: number[];
}

export type AudioViewerMode = 'default' | 'zoom' | 'draw';

export function isRectangleGroup(rectangle: IAudioViewerRectangle|IAudioViewerRectangleGroup): rectangle is IAudioViewerRectangleGroup {
  return !!(rectangle as any).rectangles;
}

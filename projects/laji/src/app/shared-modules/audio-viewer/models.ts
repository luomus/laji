export interface Audio {
  url: string;
  spectrogramUrl?: string;
  duration?: number;
}

export interface SpectrogramConfig {
  targetWindowLengthInSeconds: number;
  targetWindowOverlapPercentage: number;
  nbrOfRowsRemovedFromStart?: number; // first rows are usually very noisy and removing them improves the spectrogram
  maxNbrOfColsForNoiseEstimation?: number;
  noiseReductionParam?: number;
  logRange?: number;
  minFrequency?: number;
  maxFrequency?: number;
}

export interface AudioViewerFocusArea {
  area: Partial<AudioViewerArea>;
  color?: string;
  highlight?: boolean;
  zoomTime?: boolean;
  timePaddingOnZoom?: number;
  zoomFrequency?: boolean;
  frequencyPaddingOnZoom?: number;
}

export interface AudioViewerRectangle {
  area: Partial<AudioViewerArea>;
  color?: string;
  label?: string;
}

export interface AudioViewerRectangleGroup {
  rectangles: AudioViewerRectangle[];
  color?: string;
}

export interface AudioViewerArea {
  xRange: number[];
  yRange: number[];
}

export type AudioViewerMode = 'default' | 'zoom' | 'draw';

export interface AudioViewerControls {
  loopControl?: boolean;
  slowDownControl?: boolean;
  zoomControl?: boolean;
}

export function isRectangleGroup(rectangle: AudioViewerRectangle|AudioViewerRectangleGroup): rectangle is AudioViewerRectangleGroup {
  return !!(rectangle as any).rectangles;
}

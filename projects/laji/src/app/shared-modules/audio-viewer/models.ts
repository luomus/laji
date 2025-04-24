export interface Audio {
  url: string;
  spectrogramUrl?: string;
  duration?: number;
}

export interface SpectrogramConfig {
  sampleRate: number;
  targetWindowLengthInSeconds: number;
  targetWindowOverlapPercentage: number;
  nbrOfRowsRemovedFromStart?: number;
  maxNbrOfColsForNoiseEstimation?: number;
  noiseReductionParam?: number;
  logRange?: number;
  minFrequency?: number;
}

export interface AudioViewerFocusArea {
  area: AudioViewerArea;
  color?: string;
  highlight?: boolean;
  zoomTime?: boolean;
  timePaddingOnZoom?: number;
  zoomFrequency?: boolean;
  frequencyPaddingOnZoom?: number;
}

export interface AudioViewerRectangle {
  area: AudioViewerArea;
  color?: string;
  label?: string;
}

export interface AudioViewerRectangleGroup {
  rectangles: AudioViewerRectangle[];
  color?: string;
}

export interface AudioViewerArea {
  xRange?: number[];
  yRange?: number[];
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

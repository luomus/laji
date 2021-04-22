import { Geometry } from 'geojson';

export interface IAudio {
  url: string;
  dateTime: string;
  municipality: string;
  geometry: Geometry;
}

export interface IAudioViewerArea {
  xRange?: number[];
  yRange?: number[];
}

export type AudioViewerMode = 'default' | 'brush';

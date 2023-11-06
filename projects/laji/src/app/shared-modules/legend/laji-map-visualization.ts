import { Feature } from 'geojson';
import { GetFeatureStyleOptions } from '@luomus/laji-map';
import { MarkerCluster, PathOptions } from 'leaflet';

export interface LajiMapVisualizationItem {
  label: string;
  categories: LajiMapVisualizationCategory[];
  getFeatureStyle?: (opt: GetFeatureStyleOptions) => PathOptions;
  getClusterColor?: (childMarkers: L.Marker[]) => string;
}

export interface LajiMapVisualizationCategory { color: string; label?: string };
export type LajiMapVisualization<T extends string> = Record<T, LajiMapVisualizationItem>;

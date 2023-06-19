import { Feature } from 'geojson';
import { GetFeatureStyleOptions } from 'laji-map';
import { MarkerCluster, PathOptions } from 'leaflet';

export interface LajiMapVisualizationItem {
  label: string;
  categories: LajiMapVisualizationCategory[];
  getFeatureStyle?: (opt: GetFeatureStyleOptions) => PathOptions;
  getClusterStyle?: (childCount: number, featureIdxs: number[], cluster: MarkerCluster, features?: Feature[]) => PathOptions;
  getClusterClassName?: (childCount: number, featureIdxs: number[], cluster: MarkerCluster, features?: Feature[]) => string;
}

export interface LajiMapVisualizationCategory { color: string; label?: string };
export type LajiMapVisualization<T extends string> = Record<T, LajiMapVisualizationItem>;

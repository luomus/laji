import { GetFeatureStyleOptions } from 'laji-map';
import { MarkerCluster, PathOptions } from 'leaflet';

export interface LajiMapVisualizationCategory { color: string; label: string };
export type LajiMapVisualization<T extends string> = Record<T,
  {
    label: string;
    categories: LajiMapVisualizationCategory[];
    getFeatureStyle?: (opt: GetFeatureStyleOptions) => PathOptions;
    getClusterStyle?: (childCount: number, featureIdxs: number[], cluster: MarkerCluster) => PathOptions;
    getClusterClassName?: (childCount: number, featureIdxs: number[], cluster: MarkerCluster) => string;
  }
>;

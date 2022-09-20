import { GetFeatureStyleOptions } from "laji-map";
import { MarkerCluster, PathOptions } from "leaflet";

export type LajiMapVisualizationCategory = { color: string, label: string };
export type LajiMapVisualization<T extends string> = Record<T,
  {
    label: string,
    categories: LajiMapVisualizationCategory[],
    getFeatureStyle: (opt: GetFeatureStyleOptions) => PathOptions,
    getClusterStyle: (childCount: number, featureIdxs: number[], cluster: MarkerCluster) => PathOptions 
  }
>;

import { LajiMapVisualizationCategory as a, LajiMapVisualization as b } from '../../laji-map/visualization/laji-map-visualization';

export type LajiMapVisualizationCategory = a;
export type LajiMapVisualization<T extends string> = b<T>;

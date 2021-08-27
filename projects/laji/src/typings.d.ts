// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html
declare module 'electron';
declare let d3: any;

declare module '*.json' {
   const value: any;
   export default value;
}

import * as L from 'leaflet';
declare module 'leaflet' {
  export class GeometryUtil {
    static computeAngle(a: L.Point, b: L.Point): number;
    static closest(map: L.Map, layer: L.Layer, latlng: L.LatLng, vertices?: boolean): L.LatLng;
    static readableArea(area: any, bool: boolean): any;
    static geodesicArea(latlng: L.LatLng): any;
  }
}

declare module 'chart.js' {
  declare namespace Chart {
    export type ChartType = 'line' | 'bar' | 'horizontalBar' | 'radar' | 'doughnut' | 'polarArea' | 'bubble' | 'pie' | 'scatter' | 'LineWithLine';
  }
  export = Chart;
  export as namespace Chart;
}

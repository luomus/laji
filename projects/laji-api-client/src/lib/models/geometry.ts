/* tslint:disable:max-line-length */

import { GeometryObject } from 'geojson';

/**
 * GeoJSon geometry
 */
export interface Geometry extends GeometryObject {
  coordinateVerbatim?: string;
}

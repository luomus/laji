/* tslint:disable */

/**
 * GeoJSon geometry
 */
export interface Geometry {

  /**
   * the geometry type
   */
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
}

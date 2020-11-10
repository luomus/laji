export interface Geometry {
  type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'GeometryCollection';
  coordinates?: any;
  geometries?: Geometry;
  crs?: string;
}

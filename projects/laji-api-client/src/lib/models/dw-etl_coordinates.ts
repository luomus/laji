/* tslint:disable */
export interface DwETL_Coordinates {
  latMin?: number;
  latMax?: number;
  lonMin?: number;
  lonMax?: number;
  accuracyInMeters?: number;
  type?: 'WGS84' | 'EUREF' | 'YKJ';
}

/* tslint:disable */
import { DwSingle_Coordinates } from './dw-single-_coordinates';
import { DwSingle_SingleCoordinates } from './dw-single-_single-coordinates';
export interface DwSingle_GatheringConversions {
  linelengthInMeters?: number;
  wgs84?: DwSingle_Coordinates;
  euref?: DwSingle_Coordinates;
  ykj?: DwSingle_Coordinates;
  ykj10kmCenter?: DwSingle_SingleCoordinates;
  ykj1kmCenter?: DwSingle_SingleCoordinates;
  century?: number;
  decade?: number;
  year?: number;
  month?: number;
  day?: number;
  dayOfYearBegin?: number;
  dayOfYearEnd?: number;
  boundingBoxAreaInSquareMeters?: number;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  eurefGeo?: {};
  eurefWKT?: string;
  wgs84CenterPoint?: DwSingle_SingleCoordinates;
  seasonBegin?: number;
  seasonEnd?: number;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  wgs84Geo?: {};
  wgs84Grid005?: DwSingle_SingleCoordinates;
  wgs84Grid01?: DwSingle_SingleCoordinates;
  wgs84Grid05?: DwSingle_SingleCoordinates;
  wgs84Grid1?: DwSingle_SingleCoordinates;
  wgs84WKT?: string;
  ykj100km?: DwSingle_SingleCoordinates;
  ykj100kmCenter?: DwSingle_SingleCoordinates;
  ykj10km?: DwSingle_SingleCoordinates;
  ykj1km?: DwSingle_SingleCoordinates;
  ykj50km?: DwSingle_SingleCoordinates;
  ykj50kmCenter?: DwSingle_SingleCoordinates;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  ykjGeo?: {};
  ykjWKT?: string;
}

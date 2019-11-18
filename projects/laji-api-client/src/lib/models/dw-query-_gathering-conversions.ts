/* tslint:disable */
import { DwQuery_Coordinates } from './dw-query-_coordinates';
import { DwQuery_SingleCoordinates } from './dw-query-_single-coordinates';
export interface DwQuery_GatheringConversions {
  linelengthInMeters?: number;
  wgs84?: DwQuery_Coordinates;
  euref?: DwQuery_Coordinates;
  ykj?: DwQuery_Coordinates;
  ykj10kmCenter?: DwQuery_SingleCoordinates;
  ykj1kmCenter?: DwQuery_SingleCoordinates;
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
  wgs84CenterPoint?: DwQuery_SingleCoordinates;
  seasonBegin?: number;
  seasonEnd?: number;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  wgs84Geo?: {};
  wgs84Grid005?: DwQuery_SingleCoordinates;
  wgs84Grid01?: DwQuery_SingleCoordinates;
  wgs84Grid05?: DwQuery_SingleCoordinates;
  wgs84Grid1?: DwQuery_SingleCoordinates;
  wgs84WKT?: string;
  ykj100km?: DwQuery_SingleCoordinates;
  ykj100kmCenter?: DwQuery_SingleCoordinates;
  ykj10km?: DwQuery_SingleCoordinates;
  ykj1km?: DwQuery_SingleCoordinates;
  ykj50km?: DwQuery_SingleCoordinates;
  ykj50kmCenter?: DwQuery_SingleCoordinates;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  ykjGeo?: {};
  ykjWKT?: string;
}

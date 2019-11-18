/* tslint:disable */
import { DwETL_Coordinates } from './dw-etl_coordinates';
import { DwETL_DateRange } from './dw-etl_date-range';
import { DwETL_GatheringQuality } from './dw-etl_gathering-quality';
import { DwETL_Fact } from './dw-etl_fact';
import { DwETL_MediaObject } from './dw-etl_media-object';
import { DwETL_TaxonCensus } from './dw-etl_taxon-census';
import { DwETL_Unit } from './dw-etl_unit';
export interface DwETL_Gathering {
  biogeographicalProvince?: string;
  gatheringId?: string;
  coordinates?: DwETL_Coordinates;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  geo?: {};
  eventDate?: DwETL_DateRange;
  hourBegin?: number;
  hourEnd?: number;
  team?: Array<string>;
  higherGeography?: string;
  country?: string;
  municipality?: string;
  quality?: DwETL_GatheringQuality;
  province?: string;
  locality?: string;
  notes?: string;
  coordinatesVerbatim?: string;
  facts?: Array<DwETL_Fact>;
  media?: Array<DwETL_MediaObject>;
  minutesBegin?: number;
  minutesEnd?: number;
  observerUserIds?: Array<string>;
  taxonCensus?: Array<DwETL_TaxonCensus>;
  units?: Array<DwETL_Unit>;
}

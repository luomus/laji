/* tslint:disable */
import { DwQuery_GatheringQuality } from './dw-query-_gathering-quality';
import { DwQuery_DateRange } from './dw-query-_date-range';
import { DwQuery_GatheringConversions } from './dw-query-_gathering-conversions';
import { DwQuery_GatheringInterpretations } from './dw-query-_gathering-interpretations';
import { DwQuery_Fact } from './dw-query-_fact';
import { DwQuery_GatheringDWLinkings } from './dw-query-_gathering-dwlinkings';
import { DwQuery_MediaObject } from './dw-query-_media-object';
import { DwQuery_TaxonCensus } from './dw-query-_taxon-census';
export interface DwQuery_Gathering {
  municipality?: string;
  gatheringId?: string;
  quality?: DwQuery_GatheringQuality;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  geo?: {};
  eventDate?: DwQuery_DateRange;
  hourBegin?: number;
  hourEnd?: number;
  displayDateTime?: string;
  team?: Array<string>;
  conversions?: DwQuery_GatheringConversions;
  interpretations?: DwQuery_GatheringInterpretations;
  higherGeography?: string;
  country?: string;
  gatheringOrder?: number;
  biogeographicalProvince?: string;
  province?: string;
  locality?: string;
  notes?: string;
  coordinatesVerbatim?: string;
  facts?: Array<DwQuery_Fact>;
  linkings?: DwQuery_GatheringDWLinkings;
  media?: Array<DwQuery_MediaObject>;
  mediaCount?: number;
  minutesBegin?: number;
  minutesEnd?: number;
  observerUserIds?: Array<string>;
  taxonCensus?: Array<DwQuery_TaxonCensus>;
}

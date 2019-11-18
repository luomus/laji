/* tslint:disable */
import { DwSingle_GatheringQuality } from './dw-single-_gathering-quality';
import { DwSingle_DateRange } from './dw-single-_date-range';
import { DwSingle_GatheringConversions } from './dw-single-_gathering-conversions';
import { DwSingle_GatheringInterpretations } from './dw-single-_gathering-interpretations';
import { DwSingle_Fact } from './dw-single-_fact';
import { DwSingle_GatheringDWLinkings } from './dw-single-_gathering-dwlinkings';
import { DwSingle_MediaObject } from './dw-single-_media-object';
import { DwSingle_TaxonCensus } from './dw-single-_taxon-census';
import { DwSingle_Unit } from './dw-single-_unit';
export interface DwSingle_Gathering {
  biogeographicalProvince?: string;
  gatheringId?: string;
  quality?: DwSingle_GatheringQuality;

  /**
   * GeoJSON object with custom "csr" required property that takes in values WGS84,EUREF,YKJ
   */
  geo?: {};
  eventDate?: DwSingle_DateRange;
  hourBegin?: number;
  hourEnd?: number;
  displayDateTime?: string;
  team?: Array<string>;
  conversions?: DwSingle_GatheringConversions;
  interpretations?: DwSingle_GatheringInterpretations;
  higherGeography?: string;
  country?: string;
  municipality?: string;
  gatheringOrder?: number;
  province?: string;
  locality?: string;
  notes?: string;
  coordinatesVerbatim?: string;
  facts?: Array<DwSingle_Fact>;
  linkings?: DwSingle_GatheringDWLinkings;
  media?: Array<DwSingle_MediaObject>;
  mediaCount?: number;
  minutesBegin?: number;
  minutesEnd?: number;
  observerUserIds?: Array<string>;
  taxonCensus?: Array<DwSingle_TaxonCensus>;
  units?: Array<DwSingle_Unit>;
}

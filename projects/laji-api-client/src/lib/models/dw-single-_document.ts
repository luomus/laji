/* tslint:disable */
import { DwSingle_DocumentQuality } from './dw-single-_document-quality';
import { DwSingle_Annotation } from './dw-single-_annotation';
import { DwSingle_Fact } from './dw-single-_fact';
import { DwSingle_Gathering } from './dw-single-_gathering';
import { DwSingle_DocumentDWLinkings } from './dw-single-_document-dwlinkings';
import { DwSingle_MediaObject } from './dw-single-_media-object';
export interface DwSingle_Document {
  modifiedDate?: string;
  documentId?: string;
  secureReasons?: Array<'DEFAULT_TAXON_CONSERVATION' | 'BREEDING_SITE_CONSERVATION' | 'NATURA_AREA_CONSERVATION' | 'WINTER_SEASON_TAXON_CONSERVATION' | 'BREEDING_SEASON_TAXON_CONSERVATION' | 'CUSTOM' | 'USER_HIDDEN' | 'DATA_QUARANTINE_PERIOD' | 'ONLY_PRIVATE'>;
  partial?: boolean;
  collectionId?: string;
  licenseId?: string;
  quality?: DwSingle_DocumentQuality;
  sourceId?: string;
  namedPlaceId?: string;
  keywords?: Array<string>;
  firstLoadDate?: string;
  loadDate?: string;
  createdDate?: string;
  secureLevel?: 'NOSHOW' | 'HIGHEST' | 'KM100' | 'KM50' | 'KM25' | 'KM10' | 'KM5' | 'KM1' | 'NONE';
  notes?: string;
  annotations?: Array<DwSingle_Annotation>;
  conservationReasonSecured?: boolean;
  customReasonSecured?: boolean;
  dataQuarantinePeriodReasonSecured?: boolean;
  editorUserIds?: Array<string>;
  facts?: Array<DwSingle_Fact>;
  formId?: string;
  gatherings?: Array<DwSingle_Gathering>;
  linkings?: DwSingle_DocumentDWLinkings;
  media?: Array<DwSingle_MediaObject>;
  mediaCount?: number;
  secured?: boolean;
}

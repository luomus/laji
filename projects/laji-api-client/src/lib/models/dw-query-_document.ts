/* tslint:disable */
import { DwQuery_DocumentQuality } from './dw-query-_document-quality';
import { DwQuery_Annotation } from './dw-query-_annotation';
import { DwQuery_Fact } from './dw-query-_fact';
import { DwQuery_DocumentDWLinkings } from './dw-query-_document-dwlinkings';
import { DwQuery_MediaObject } from './dw-query-_media-object';
export interface DwQuery_Document {
  modifiedDate?: string;
  documentId?: string;
  secureReasons?: Array<'DEFAULT_TAXON_CONSERVATION' | 'BREEDING_SITE_CONSERVATION' | 'NATURA_AREA_CONSERVATION' | 'WINTER_SEASON_TAXON_CONSERVATION' | 'BREEDING_SEASON_TAXON_CONSERVATION' | 'CUSTOM' | 'USER_HIDDEN' | 'DATA_QUARANTINE_PERIOD' | 'ONLY_PRIVATE'>;
  partial?: boolean;
  collectionId?: string;
  licenseId?: string;
  quality?: DwQuery_DocumentQuality;
  sourceId?: string;
  namedPlaceId?: string;
  keywords?: Array<string>;
  firstLoadDate?: string;
  loadDate?: string;
  createdDate?: string;
  secureLevel?: 'NOSHOW' | 'HIGHEST' | 'KM100' | 'KM50' | 'KM25' | 'KM10' | 'KM5' | 'KM1' | 'NONE';
  notes?: string;
  annotations?: Array<DwQuery_Annotation>;
  conservationReasonSecured?: boolean;
  customReasonSecured?: boolean;
  dataQuarantinePeriodReasonSecured?: boolean;
  editorUserIds?: Array<string>;
  facts?: Array<DwQuery_Fact>;
  formId?: string;
  linkings?: DwQuery_DocumentDWLinkings;
  media?: Array<DwQuery_MediaObject>;
  mediaCount?: number;
  secured?: boolean;
}

/* tslint:disable */
import { DwETL_DocumentQuality } from './dw-etl_document-quality';
import { DwETL_Annotation } from './dw-etl_annotation';
import { DwETL_Fact } from './dw-etl_fact';
import { DwETL_Gathering } from './dw-etl_gathering';
import { DwETL_MediaObject } from './dw-etl_media-object';
export interface DwETL_Document {
  modifiedDate?: string;
  documentId?: string;
  secureReasons?: Array<'DEFAULT_TAXON_CONSERVATION' | 'BREEDING_SITE_CONSERVATION' | 'NATURA_AREA_CONSERVATION' | 'WINTER_SEASON_TAXON_CONSERVATION' | 'BREEDING_SEASON_TAXON_CONSERVATION' | 'CUSTOM' | 'USER_HIDDEN' | 'DATA_QUARANTINE_PERIOD' | 'ONLY_PRIVATE'>;
  collectionId?: string;
  licenseId?: string;
  quality?: DwETL_DocumentQuality;
  sourceId?: string;
  namedPlaceId?: string;
  keywords?: Array<string>;
  createdDate?: string;
  secureLevel?: 'NOSHOW' | 'HIGHEST' | 'KM100' | 'KM50' | 'KM25' | 'KM10' | 'KM5' | 'KM1' | 'NONE';
  notes?: string;
  annotations?: Array<DwETL_Annotation>;
  concealment?: 'PUBLIC' | 'PRIVATE';
  deleted?: boolean;
  editorUserIds?: Array<string>;
  facts?: Array<DwETL_Fact>;
  formId?: string;
  gatherings?: Array<DwETL_Gathering>;
  media?: Array<DwETL_MediaObject>;
}

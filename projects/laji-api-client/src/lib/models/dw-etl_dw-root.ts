/* tslint:disable */
import { DwETL_Document } from './dw-etl_document';
export interface DwETL_DwRoot {
  documentId?: string;
  sourceId?: string;
  collectionId?: string;
  publicDocument?: DwETL_Document;
  privateDocument?: DwETL_Document;
  deleteRequest?: boolean;
}

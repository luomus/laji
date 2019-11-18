/* tslint:disable */
import { DwQuery_Fact } from './dw-query-_fact';
export interface DwQuery_Sample {
  sampleId?: string;
  collectionId?: string;
  keywords?: Array<string>;
  type?: string;
  quality?: string;
  status?: string;
  multiple?: boolean;
  sampleOrder?: number;
  notes?: string;
  facts?: Array<DwQuery_Fact>;
}

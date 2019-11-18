/* tslint:disable */
import { DwETL_Fact } from './dw-etl_fact';
export interface DwETL_Sample {
  sampleId?: string;
  collectionId?: string;
  keywords?: Array<string>;
  type?: string;
  quality?: string;
  status?: string;
  multiple?: boolean;
  notes?: string;
  facts?: Array<DwETL_Fact>;
}

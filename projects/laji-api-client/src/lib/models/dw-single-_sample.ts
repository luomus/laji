/* tslint:disable */
import { DwSingle_Fact } from './dw-single-_fact';
export interface DwSingle_Sample {
  sampleId?: string;
  collectionId?: string;
  keywords?: Array<string>;
  type?: string;
  quality?: string;
  status?: string;
  multiple?: boolean;
  sampleOrder?: number;
  notes?: string;
  facts?: Array<DwSingle_Fact>;
}

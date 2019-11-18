/* tslint:disable */
import { CoordinateBioResult } from './coordinate-bio-result';
export interface CoordinateBio {
  status: string;
  results: Array<CoordinateBioResult>;
  error_message?: string;
}

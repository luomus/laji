/* tslint:disable */
import { CoordinateBioResultAddr } from './coordinate-bio-result-addr';
import { CoordinateBioResultGeom } from './coordinate-bio-result-geom';
export interface CoordinateBioResult {
  address_components?: Array<CoordinateBioResultAddr>;
  geometry?: CoordinateBioResultGeom;
  formatted_address?: string;
  place_id?: string;
  types?: Array<string>;
}

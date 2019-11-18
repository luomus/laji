/* tslint:disable */
import { CoordinateBioResultBox } from './coordinate-bio-result-box';
import { CoordinateBioResultCoord } from './coordinate-bio-result-coord';
export interface CoordinateBioResultGeom {
  bounds?: CoordinateBioResultBox;
  location?: CoordinateBioResultCoord;
  location_type?: string;
  viewport?: CoordinateBioResultBox;
}

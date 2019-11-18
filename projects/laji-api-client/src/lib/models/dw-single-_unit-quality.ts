/* tslint:disable */
import { DwSingle_Quality } from './dw-single-_quality';
import { DwSingle_TaxonQuality } from './dw-single-_taxon-quality';
export interface DwSingle_UnitQuality {
  issue?: DwSingle_Quality;
  taxon?: DwSingle_TaxonQuality;
  documentGatheringUnitQualityIssues?: boolean;
  reliable?: boolean;
}

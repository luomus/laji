/* tslint:disable */
import { DwQuery_Quality } from './dw-query-_quality';
import { DwQuery_TaxonQuality } from './dw-query-_taxon-quality';
export interface DwQuery_UnitQuality {
  issue?: DwQuery_Quality;
  taxon?: DwQuery_TaxonQuality;
  documentGatheringUnitQualityIssues?: boolean;
  reliable?: boolean;
}

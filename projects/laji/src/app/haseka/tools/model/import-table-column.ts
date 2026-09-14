import { ObservationTableColumn } from '../../../shared-modules/observation-result/model/observation-table-column';

export interface ImportTableColumn extends ObservationTableColumn {
  externalLabel?: boolean;
}

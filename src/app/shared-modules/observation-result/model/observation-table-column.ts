import { DatatableColumn } from '../../datatable/model/datatable-column';

export interface ObservationTableColumn extends DatatableColumn {
  sortBy?: string;
  aggregateBy?: string;
}

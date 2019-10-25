import { DatatableColumn } from '../../datatable/model/datatable-column';

export interface ObservationTableColumn extends DatatableColumn {
  sortBy?: string;
  aggregateBy?: string;
  selectField?: string;
  aggregate?: boolean;
  fact?: string;
  transform?: 'label' | 'multiLang';
}

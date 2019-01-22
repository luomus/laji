import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';

export interface TaxonomyTableColumn extends DatatableColumn {
  selectField?: string;
  shownColumns?: TaxonomyTableColumn[];
}

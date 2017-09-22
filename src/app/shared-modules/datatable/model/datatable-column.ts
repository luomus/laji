import { TableColumn } from '@swimlane/ngx-datatable';

export interface DatatableColumn extends TableColumn {
  label?: string;
  target?: string;
}

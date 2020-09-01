import { TableColumn } from '@swimlane/ngx-datatable';

export interface DatatableColumn extends TableColumn {
  label?: string | string[];
  target?: string;
  info?: string;
  required?: boolean;
}

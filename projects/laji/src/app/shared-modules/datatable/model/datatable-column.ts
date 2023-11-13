import { TableColumn } from '@achimha/ngx-datatable';

export interface DatatableColumn extends TableColumn {
  label?: string | string[];
  target?: string;
  info?: string;
  required?: boolean;
  sortTemplate?: string;
}

export interface DatatableSort {
  prop: string;
  dir: 'asc' | 'desc';
}

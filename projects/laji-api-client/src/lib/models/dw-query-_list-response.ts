/* tslint:disable */
import { DwQuery_JoinedRow } from './dw-query-_joined-row';
export interface DwQuery_ListResponse {
  currentPage?: number;
  prevPage?: number;
  nextPage?: number;
  lastPage?: number;
  pageSize?: number;
  total?: number;
  results?: Array<DwQuery_JoinedRow>;
}

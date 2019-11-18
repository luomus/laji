/* tslint:disable */
import { DwQuery_AggregateRow } from './dw-query-_aggregate-row';
export interface DwQuery_AggregateResponse {
  currentPage?: number;
  prevPage?: number;
  nextPage?: number;
  lastPage?: number;
  pageSize?: number;
  total?: number;
  results?: Array<DwQuery_AggregateRow>;
}

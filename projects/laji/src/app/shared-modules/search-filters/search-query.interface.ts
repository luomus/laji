import { Observable } from 'rxjs';

export interface SearchQueryInterface {
  queryUpdated$: Observable<any>;
  query: any;
  queryType: string;
  skippedQueryParams?: string[];
  queryUpdate(data: any): void;
}

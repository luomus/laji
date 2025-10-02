import { Observable } from 'rxjs';

export interface SearchQueryInterface {
  searchUpdated$: Observable<any>;
  query: any;
  queryType: string;
  skippedQueryParams?: string[];
  queryUpdate(data: any): void;
}

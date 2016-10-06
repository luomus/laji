import { Observable } from 'rxjs';

export interface ObservationFilterInterface {
  title: string;
  field: string;
  pick?: string[];
  filter: string;
  type: 'array'|'boolean';
  valueMap?: {[field: string]: string};
  booleanMap?: any;
  size: number;
  data?: FilterDataInterface[];
  selected: string[];
  total?: number;
  pager?: boolean;
  map?: (data: any) => Observable<any>;
}

export interface FilterDataInterface {
  value: string;
  count: number;
  selected: boolean;
}

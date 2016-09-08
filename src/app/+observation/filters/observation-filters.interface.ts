import {Observable} from "rxjs";

export interface ObservationFilterInterface {
  title:string;
  field:string;
  pick?:string[],
  filter:string;
  type:string;
  valueMap?:{[field:string]:string};
  booleanMap?:{[field:string]:boolean};
  size?:number;
  data?:FilterDataInterface[];
  selected:string[];
  total?:number;
  map?:(data:any) => Observable<any>
}

export interface FilterDataInterface {
  value:string;
  count: number;
  selected:boolean;
}

export interface ObservationFilterInterface {
  title:string;
  field:string;
  pick?:string[],
  filter:string;
  type:string;
  valueMap?:any;
  booleanMap?:any;
  size?:number;
  data?:FilterDataInterface[];
  selected:string[];
  total?:number;
}

export interface FilterDataInterface {
  value:string;
  count: number;
  selected:boolean;
}

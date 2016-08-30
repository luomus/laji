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
  selected:FilterDataInterface[];
  total?:number;
}

export interface FilterDataInterface {
  value:string;
  count: number;
  selected:boolean;
}

import {FilterDataInterface} from "../filters/observation-filters.interface";

export interface ObservationFormQuery {
  taxon:string;
  timeStart: string;
  timeEnd: string;
  informalTaxonGroupId: string;
  individualCountMin:string;
  individualCountMax:string;
  administrativeStatusId:string;
  redListStatusId:string;
  lifeStage:string;
  sex:string;
}

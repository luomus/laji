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
  validTaxa:boolean;
  invasive:boolean;
  typeSpecimen:boolean;
  hasMedia:boolean;
}

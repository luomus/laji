export interface ObservationFormQuery {
  taxon:string;
  timeStart: string;
  timeEnd: string;
  informalTaxonGroupId: string;
  individualCountMin:string;
  individualCountMax:string;
  includeNonValidTaxa:boolean;
  invasive:boolean;
  typeSpecimen:boolean;
  hasMedia:boolean;
}

/* tslint:disable */
import { DwQuery_Document } from './dw-query-_document';
import { DwQuery_Gathering } from './dw-query-_gathering';
import { DwQuery_Unit } from './dw-query-_unit';
import { DwQuery_Annotation } from './dw-query-_annotation';
import { DwQuery_MediaObject } from './dw-query-_media-object';
import { DwQuery_Sample } from './dw-query-_sample';
export interface DwQuery_JoinedRow {
  document?: DwQuery_Document;
  gathering?: DwQuery_Gathering;
  unit?: DwQuery_Unit;
  annotation?: DwQuery_Annotation;
  media?: DwQuery_MediaObject;
  sample?: DwQuery_Sample;
}

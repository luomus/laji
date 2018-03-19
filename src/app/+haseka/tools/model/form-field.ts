export const DOCUMENT_LEVEL = 'document';
export const GATHERING_LEVEL = 'gatherings';
export const IGNORE_VALUE = '__IGNORE__';

export enum FieldMap {
  ignore = <any>IGNORE_VALUE
}

export interface FormField {
  label: string;
  fullLabel: string;
  key: string;
  parent: string;
  required: boolean;
  isArray: boolean;
  type: string;
  enum?: string[];
  enumNames?: string[];
  default?: any;
  col?: string;
  previousValue?: any;
}

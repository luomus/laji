export const DOCUMENT_LEVEL = 'document';
export const IGNORE_VALUE = '_IGNORE_';

export enum FieldMap {
  ignore = <any>IGNORE_VALUE
}

export interface FormField {
  label: string;
  fullLabel: string;
  key: string;
  parent: string;
  required: boolean;
  type: string;
  enum?: string[];
  enumNames?: string[];
  default?: any;
  col?: string;
  previousValue?: any;
}

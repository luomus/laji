export const DOCUMENT_LEVEL = 'document';
export const GATHERING_LEVEL = 'gatherings';
export const VALUE_IGNORE = '__IGNORE__';
export const VALUE_AS_IS = '__VALUE_AS_IS__';

export enum FieldMap {
  ignore = <any>VALUE_IGNORE
}

export interface FormField {
  label: string;
  fullLabel: string;
  key: string;
  parent: string;
  required: boolean;
  isArray: boolean;
  type: string;
  subGroup?: string;
  enum?: string[];
  enumNames?: string[];
  default?: any;
  col?: string;
  previousValue?: any;
}

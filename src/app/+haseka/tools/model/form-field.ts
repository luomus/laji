export const DOCUMENT_LEVEL = 'document';

export enum FieldMap {
  ignore = '_ignore'
}

export interface FormField {
  label: string;
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

export const LEVEL_DOCUMENT = 'document';
export const LEVEL_GATHERING = 'gatherings';
export const LEVEL_UNIT = 'units';
export const LEVEL_TAXON_CENSUS = 'taxonCensus';

export const VALUE_IGNORE = '__IGNORE__';
export const VALUE_AS_IS = '__VALUE_AS_IS__';

export enum FieldMap {
  ignore = <any>VALUE_IGNORE
}

export interface IFormField {
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


export interface IColMap {
  [key: string]: string;
}

export interface IValueMerge {
  _merge_: {
    [path: string]: any;
  };
}

export type TUserValueMap = string|number|boolean|IValueMerge;

export interface IValueMap {
  [key: string]: {
    [value: string]: TUserValueMap;
  };
}

export interface IUserMappings {
  col: IColMap;
  value: IValueMap;
}

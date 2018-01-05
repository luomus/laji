export interface FormField {
  label: string;
  key: string;
  parent: string;
  required: boolean;
  type: string;
  enum?: string[];
  enumNames?: string[];
  default?: any;
}

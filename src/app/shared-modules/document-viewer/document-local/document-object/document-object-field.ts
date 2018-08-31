import { TemplateRef } from '@angular/core';

export interface DocumentObjectField {
  name: string,
  label: string,
  type: string;
  template: TemplateRef<any>,
  enums?: any,
  fields?: DocumentObjectField[]
}

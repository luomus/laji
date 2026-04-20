import type { components } from 'projects/laji-api-client-b/generated/api.d';

type Document = components['schemas']['store-document'];

export interface TemplateForm {
  name: string;
  description: string;
  document?: Document;
}

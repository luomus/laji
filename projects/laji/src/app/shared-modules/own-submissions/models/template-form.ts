import { Document } from '../../../shared/model/Document';

export interface TemplateForm {
  name: string;
  description: string;
  document?: Document;
}

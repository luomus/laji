import { Form } from '../../shared/model/Form';

export interface FormCategory {
  forms: Form.List[];
  category: string;
  label: string;
}

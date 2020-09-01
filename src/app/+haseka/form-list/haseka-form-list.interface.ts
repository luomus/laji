import { Form } from '../../shared/model/Form';

export interface FormList extends Form.List {
  hasAdminRight: boolean;
}

export interface FormCategory {
  forms: FormList[];
  category: string;
  label: string;
}

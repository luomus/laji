import { Form } from '../../shared/model/Form';

interface FormListWithAdmin extends Form.List {
  hasAdminRight?: boolean;
}

export interface FormCategory {
  forms: FormListWithAdmin[];
  category: string;
  label: string;
}

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import {FormCategory} from "../haseka-form-list.interface";


@Component({
  selector: 'laji-form-category',
  templateUrl: './form-category.component.html',
  styleUrls: ['./form-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCategoryComponent {

  @Input() title: string;
  @Input() formList: FormCategory['forms'] = [];
  @Input() tmpDocument: { [formId: string]: string } = {};

  trackForm(idx, form) {
    return form ? form.id : undefined;
  }

}

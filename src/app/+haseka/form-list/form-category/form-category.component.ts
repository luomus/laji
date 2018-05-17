import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormList } from '../haseka-form-list';

@Component({
  selector: 'laji-form-category',
  templateUrl: './form-category.component.html',
  styleUrls: ['./form-category.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCategoryComponent {

  @Input() title: string;
  @Input() formList: FormList[] = [];
  @Input() tmpDocument: { [formId: string]: string } = {};

  constructor() { }

  trackForm(idx, form) {
    return form ? form.id : undefined;
  }

}

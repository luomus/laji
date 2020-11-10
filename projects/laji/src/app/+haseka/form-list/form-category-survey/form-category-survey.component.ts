import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-form-category-survey',
  templateUrl: './form-category-survey.component.html',
  styleUrls: ['./form-category-survey.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCategorySurveyComponent {
  @Input() title: string;
  @Input() formList: Form.List[] = [];
  @Input() tmpDocument: { [formId: string]: string } = {};
  @Input() category: string;

  trackForm(idx, form) {
    return form ? form.id : undefined;
  }
}

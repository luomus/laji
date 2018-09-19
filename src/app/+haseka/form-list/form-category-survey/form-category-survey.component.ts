import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormList } from '../haseka-form-list';
import { Global } from '../../../../environments/global';

@Component({
  selector: 'laji-form-category-survey',
  templateUrl: './form-category-survey.component.html',
  styleUrls: ['./form-category-survey.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormCategorySurveyComponent {

  themes = Global.formsTheme;

  @Input() title: string;
  @Input() formList: FormList[] = [];
  @Input() tmpDocument: { [formId: string]: string } = {};

  constructor() { }

  trackForm(idx, form) {
    return form ? form.id : undefined;
  }

}

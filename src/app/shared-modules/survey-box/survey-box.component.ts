import { Component, Input } from '@angular/core';
import { FormList } from 'app/+haseka/form-list/haseka-form-list';
import { Global } from 'environments/global';
@Component({
  selector: 'laji-survey-box',
  templateUrl: './survey-box.component.html',
  styleUrls: ['./survey-box.component.scss']
})
export class SurveyBoxComponent {
  themes = Global.formsTheme;
  waterbirdForm = Global.forms.waterbirdPairForm;

  @Input() form: FormList;

  isFormIdInThemes(formId) {
    return Object.keys(Global.formsTheme).includes(formId);
  }
}

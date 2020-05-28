import { Component, Input } from '@angular/core';
import { Global } from '../../../environments/global';
import { FormList } from '../../+haseka/form-list/haseka-form-list.interface';

@Component({
  selector: 'laji-survey-box',
  templateUrl: './survey-box.component.html',
  styleUrls: ['./survey-box.component.scss']
})
export class SurveyBoxComponent {
  themes = Global.formsTheme;
  waterbirdForm = Global.forms.waterbirdPairForm;

  @Input() form: FormList;
  @Input() comingSoonForm: {link: string, title: string, logo?: string};
  @Input() externalUrl: string = undefined;

  isFormIdInThemes(formId) {
    return Object.keys(Global.formsTheme).includes(formId);
  }
}

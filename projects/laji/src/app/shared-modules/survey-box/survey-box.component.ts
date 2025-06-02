import { Component, Input } from '@angular/core';
import { Form } from '../../shared/model/Form';
import { Global } from '../../../environments/global';

@Component({
  selector: 'laji-survey-box',
  templateUrl: './survey-box.component.html',
  styleUrls: ['./survey-box.component.scss']
})
export class SurveyBoxComponent {
  @Input() form!: Form.List;

  formLink(): string[] {
    if (this.form.options?.openForm) {
      let id = this.form.id;
      const aliasKey = Object.keys(Global.formAliasMap).find(key => Global.formAliasMap[key] === id);
      if (aliasKey) {
        id = aliasKey;
      }
      return [`/project/${id}`];
    }
    return ['/project', this.form.id];
  }
}

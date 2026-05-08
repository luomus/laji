import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Global } from '../../../environments/global';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type FormListing = components['schemas']['FormListing'];

@Component({
    selector: 'laji-survey-box',
    templateUrl: './survey-box.component.html',
    styleUrls: ['./survey-box.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SurveyBoxComponent {
  @Input() form!: FormListing;

  getFormLink(): string[] {
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

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
  @Input() title: string;
  @Input() formList: FormList[] = [];
  @Input() tmpDocument: { [formId: string]: string } = {};
  @Input() category: string;

  trackForm(idx, form) {
    return form ? form.id : undefined;
  }

  get showWaterbirdComingSoonBox() {
    return this.category === 'MHL.categoryBirdMonitoringSchemes'
    && (
      this.formList && this.formList.filter(
        form => (form.id === Global.forms.waterbirdJuvenileForm || form.id === Global.forms.waterbirdPairForm)
      ).length === 0
    );
  }
}

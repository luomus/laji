import { Component, Input } from '@angular/core';
import { Form } from '../../shared/model/Form';

@Component({
  selector: 'laji-survey-box',
  templateUrl: './survey-box.component.html',
  styleUrls: ['./survey-box.component.scss']
})
export class SurveyBoxComponent {
  @Input() form: Form.List;
  @Input() comingSoonForm: {link: string, title: string, logo?: string};
}

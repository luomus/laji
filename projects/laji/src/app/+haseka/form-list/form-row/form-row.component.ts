import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-form-row',
  templateUrl: './form-row.component.html',
  styleUrls: ['./form-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRowComponent {

  @Input() tmpDocuments: {[formId: string]: string} = {};
  @Input() hasAdminRight = false;
  @Input() form: Form.List;

}

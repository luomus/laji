import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-dataset-about',
  templateUrl: './dataset-about.component.html',
  styleUrls: ['./dataset-about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetAboutComponent {
  @Input() form: Form.SchemaForm;
}

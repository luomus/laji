import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Form } from '../../../../shared/model/Form';
import { FormService } from '../../../../shared/service/form.service';

@Component({
  selector: 'laji-generic-instructions',
  templateUrl: './generic-instructions.component.html',
  styleUrls: ['./generic-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericInstructionsComponent {

  isSecondary = false;
  private _form: Form.List;

  @Input() set form (form: Form.List) {
    this.isSecondary = FormService.hasFeature(form, Form.Feature.SecondaryCopy);
    this._form = form;
  }

  get form() {
    return this._form;
  }
}

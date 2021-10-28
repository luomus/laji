import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { IUserSettings } from '../../../../shared/service/user.service';
import { Form } from 'projects/laji/src/app/shared/model/Form';

@Component({
  selector: 'laji-form',
  template: '',
})
export class LajiFormComponent {

  @Input() form: Form.SchemaForm;
  @Input() formData: any = {};
  @Input() settingsKey: keyof IUserSettings = 'formDefault';
  @Input() showShortcutButton = true;

  @Output() dataSubmit = new EventEmitter();
  @Output() dataChange = new EventEmitter();
  @Output() validationError = new EventEmitter();
  @Output() goBack = new EventEmitter();

  block() { }
  unBlock() { }
  submit() { }
  submitOnlySchemaValidations() { }
  displayErrorModal(type: 'saveError' | 'reactCrash') { }
}

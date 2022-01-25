import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { Readonly } from '../../../../shared-modules/own-submissions/service/document.service';
import { Form } from 'projects/laji/src/app/shared/model/Form';

export type LajiFormFooterStatus = '' | 'success' | 'error' | 'unsaved';

@Component({
  selector: 'laji-form-footer',
  template: ''
})
export class LajiFormFooterComponent {
  @Input() status: LajiFormFooterStatus = '';
  @Input() saving = false;
  @Input() readonly: Readonly;
  @Input() edit = false;
  @Input() lajiForm: LajiFormComponent;
  @Input() template = false;
  @Input() locked: boolean;
  @Input() isAdmin: boolean;
  @Input() dateEdited: string;
  @Output() submitPublic = new EventEmitter();
  @Output() submitPrivate = new EventEmitter();
  @Output() submitTemplate = new EventEmitter();
  @Output() leave = new EventEmitter();
  @Output() lock = new EventEmitter<boolean>();
  @Input() form: Form.SchemaForm;
  @Input() errors: any

  @Input() touchedCounter: number
}

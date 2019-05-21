import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-document-form-footer',
  templateUrl: './document-form-footer.component.html',
  styleUrls: ['./document-form-footer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormFooterComponent {
  @Input() status = '';
  @Input() saving = false;
  @Input() readonly = false;
  @Input() edit = false;
  @Output() submitPublic = new EventEmitter();
  @Output() submitPrivate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() lock = new EventEmitter<boolean>();
  _form: any;
  _locked: boolean;
  _admin = false;
  show = {
    save: false,
    temp: false,
    cancel: false
  };
  displayFeedback = true;

  constructor() { }

  isString(val) { return typeof val === 'string'; }

  displaysSaveContainer() { return this._admin || this.show.save; }

  @Input()
  set form(form: any) {
    this._form = form;
    this._admin = form && form.uiSchemaContext && form.uiSchemaContext.isAdmin;
    this._locked = form && form && (form.features || []).indexOf(Form.Feature.AdminLockable) > -1
      ? !!form.formData.locked
      : undefined;
    ['save', 'temp', 'cancel'].forEach(prop => {
      let show: boolean;

      if (!form || !form.actions) {
        if (prop !== 'temp' || !form.features || form.features.indexOf(Form.Feature.Mobile) === -1) {
          show = true;
        }
      } else {
        show = prop in form.actions;
      }
      if (this.readonly && (prop === 'save' || prop === 'temp')) {
        show = false;
      }
      this.show[prop] = show;
    });

    if ((form.features || []).indexOf(Form.Feature.Mobile) !== -1) {
      this.displayFeedback = false;
    }
  }

  buttonLabel(prop: 'save'|'temp'|'cancel') {
    if (this._form && this._form.actions && this._form.actions[prop]) {
      if (prop === 'save' && this.edit && this._form.actions.edit) {
        return this._form.actions.edit;
      }
      return this._form.actions[prop];
    }
    if (prop === 'save') {
      return 'haseka.form.savePublic';
    } else if (prop === 'temp') {
      return 'haseka.form.savePrivate';
    }
    return 'haseka.form.back';
  }
}

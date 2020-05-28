import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import { Readonly } from '@laji-form/laji-form-document.facade';
import { FormService } from '../../../shared/service/form.service';
import { LajiFormComponent } from '@laji-form/laji-form/laji-form.component';

@Component({
  selector: 'laji-document-form-footer',
  templateUrl: './document-form-footer.component.html',
  styleUrls: ['./document-form-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormFooterComponent {
  @Input() status = '';
  @Input() saving = false;
  @Input() readonly: Readonly = Readonly.false;
  @Input() edit = false;
  @Input() lajiForm: LajiFormComponent;
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
  readonlyStates = Readonly;
  hasOnlyWarnings = false;

  constructor() { }

  @Input()
  set form(form: any) {
    if (!form) {
      return;
    }
    this._form = form;
    this._admin = form && form.uiSchemaContext && form.uiSchemaContext.isAdmin;
    this._locked = FormService.hasFeature(form, Form.Feature.AdminLockable) ? (form.formData && !!form.formData.locked) : undefined;
    ['save', 'temp', 'cancel'].forEach(prop => {
      let show: boolean;

      if (!form || !form.actions) {
        if (prop !== 'temp' || !FormService.hasFeature(form, Form.Feature.Mobile)) {
          show = true;
        }
      } else {
        show = prop in form.actions;
      }
      if ((prop === 'save' || prop === 'temp') && [Readonly.noEdit, Readonly.true].includes(this.readonly)) {
        show = false;
      }
      this.show[prop] = show;
    });

    if ((form.features || []).indexOf(Form.Feature.Mobile) !== -1) {
      this.displayFeedback = false;
    }
  }

  private _hasOnlyWarnings(errors) {
    if (errors.__errors?.length && errors.__errors.every(e => e.indexOf('[warning]') === 0)) {
      return true;
    }
    return Object.keys(errors).every(key => key !== '__errors' && this._hasOnlyWarnings(errors[key]));
  }

  @Input()
  set errors(errors: any) {
    this.hasOnlyWarnings = this._hasOnlyWarnings(errors);
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

  highlightErrorContainer() {
    this.lajiForm.popErrorListIfNeeded();
  }
}

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Form } from '../../../shared/model/Form';
import { FormWithData } from '../laji-form-document.facade';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { LajiFormUtil } from '../laji-form-util.service';
import { Readonly } from '../../own-submissions/service/document.service';

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
  @Input() template = false;
  @Output() submitPublic = new EventEmitter();
  @Output() submitPrivate = new EventEmitter();
  @Output() submitTemplate = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() lock = new EventEmitter<boolean>();
  _form: FormWithData;
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
  _touchedCounter: number;
  _touchedCounterOnErrors: number;

  constructor() { }

  @Input()
  set form(form: FormWithData) {
    if (!form) {
      return;
    }
    this._form = form;
    this._admin = form && form.uiSchemaContext && form.uiSchemaContext.isAdmin;
    this._locked = (form.formData.id?.indexOf('T:') !== 0 && form.options?.adminLockable)
      ? (form.formData && !!form.formData.locked)
      : undefined;
    const isReadOnly = [Readonly.noEdit, Readonly.true].includes(this.readonly);
    this.show = {
      save: !form.options?.hideSaveButton && !isReadOnly,
      temp: !form.options?.hideDraftButton && !isReadOnly && !form.options?.mobile ,
      cancel: !form.options?.hideCancelButton
    };

    if (form.options?.mobile) {
      this.displayFeedback = false;
    }
  }

  private _hasOnlyWarnings(errors) {
    if (errors.__errors?.length && errors.__errors.every(e => e.indexOf('[warning]') === 0)) {
      return true;
    }
    return Object.keys(errors).length && Object.keys(errors).every(key => key !== '__errors' && this._hasOnlyWarnings(errors[key]));
  }

  @Input()
  set errors(errors: any) {
    this.hasOnlyWarnings = document.querySelector('.warning-panel') && this._hasOnlyWarnings(errors);
    this._touchedCounterOnErrors = this._touchedCounter;
  }

  @Input()
  set touchedCounter(counter: number) {
    this._touchedCounter = counter;
  }

  disableIfOnlyWarnings() {
    return this.hasOnlyWarnings && this._touchedCounterOnErrors === this._touchedCounter;
  }

  buttonLabel(prop: 'save'|'temp'|'cancel') {
    const options = this._form.options || {} as Form.FormOptions;
    switch (prop) {
      case 'save':
        return this.edit && options.editLabel
          || !this.edit && options.saveLabel
          || 'haseka.form.savePublic';
      case 'temp':
        return options.draftLabel || 'haseka.form.savePrivate';
      case 'cancel':
        return options.cancelLabel || 'haseka.form.back';
    }
  }

  highlightErrorContainer() {
    this.lajiForm.popErrorListIfNeeded();
    LajiFormUtil.scrollIntoViewIfNeeded(document.querySelector('.laji-form-error-list'));
  }
}

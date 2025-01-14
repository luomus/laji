import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Form } from '../../../../shared/model/Form';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { LajiFormUtil } from '../laji-form-util.service';
import { Readonly } from '../../../../shared-modules/own-submissions/service/document.service';
import { PlatformService } from '../../../../root/platform.service';

export type LajiFormFooterStatus = '' | 'success' | 'error' | 'unsaved';

@Component({
  selector: 'laji-form-footer',
  templateUrl: './laji-form-footer.component.html',
  styleUrls: ['./laji-form-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiFormFooterComponent {
  @Input() status: LajiFormFooterStatus = '';
  @Input() saving = false;
  @Input() readonly!: Readonly;
  @Input() edit = false;
  @Input() lajiForm!: LajiFormComponent;
  @Input() template = false;
  @Input() locked!: boolean;
  @Input() isAdmin!: boolean;
  @Input() dateEdited!: string;
  @Output() submitPublic = new EventEmitter();
  @Output() submitPrivate = new EventEmitter();
  @Output() submitTemplate = new EventEmitter();
  @Output() leave = new EventEmitter();
  @Output() lock = new EventEmitter<boolean>();
  _form!: Form.SchemaForm;
  show = {
    save: false,
    temp: false,
    cancel: false
  };
  displayFeedback = true;
  readonlyStates = Readonly;
  hasOnlyWarnings = false;
  _touchedCounter!: number;
  _touchedCounterOnErrors!: number;

  constructor(private platformService: PlatformService) { }

  @Input()
  set form(form: Form.SchemaForm) {
    if (!form) {
      return;
    }
    this._form = form;
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

  private _hasOnlyWarnings(errors: any): any {
    if (errors.__errors?.length && errors.__errors.every((e: any) => e.indexOf('[warning]') === 0)) {
      return true;
    }
    return Object.keys(errors).length && Object.keys(errors).every(key => key !== '__errors' && this._hasOnlyWarnings(errors[key]));
  }

  @Input()
  set errors(errors: any) {
    this.hasOnlyWarnings = this.platformService.document.querySelector('.warning-panel') && this._hasOnlyWarnings(errors);
    this._touchedCounterOnErrors = this._touchedCounter;
  }

  @Input()
  set touchedCounter(counter: number) {
    this._touchedCounter = counter;
  }

  disableIfOnlyWarnings() {
    return this.hasOnlyWarnings && typeof this._touchedCounter === 'number' && this._touchedCounterOnErrors === this._touchedCounter;
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
    LajiFormUtil.scrollIntoViewIfNeeded(this.platformService.document.querySelector('.laji-form-error-list'));
  }
}

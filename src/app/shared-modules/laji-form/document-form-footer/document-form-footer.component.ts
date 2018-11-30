import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Output() onSubmitPublic = new EventEmitter();
  @Output() onSubmitPrivate = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onLock = new EventEmitter<boolean>();
  _form: any;
  _locked: false;
  _admin: false;
  show = {
    save: false,
    temp: false,
    cancel: false
  };

  constructor() { }

  isString(val) { return typeof val === 'string'; }

  displaysSaveContainer() { return this._admin || this.show.save}

  @Input()
  set form(form: any) {
    this._form = form;
    this._admin = form && form.uiSchemaContext && form.uiSchemaContext.isAdmin;
    this._locked = form && form.formData && form.formData.locked;
    ['save', 'temp', 'cancel'].forEach(prop => {
      let show: boolean;

      if (!form || !form.actions) {
        show = true;
      } else {
        show = prop in form.actions;
      }
      if (this.readonly && (prop === 'save' || prop === 'temp')) {
        show = false;
      }
      this.show[prop] = show;
    });
  }

  buttonLabel(place: 'save'|'temp'|'cancel') {
    if (this.form && this.form.actions && this.form.actions[place]) {
      return this.form.actions[place];
    }
    if (place === 'save') {
      return 'haseka.form.savePublic';
    } else if (place === 'temp') {
      return 'haseka.form.savePrivate';
    }
    return 'haseka.form.back';
  }
}

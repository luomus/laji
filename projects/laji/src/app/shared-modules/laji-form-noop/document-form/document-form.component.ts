import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { Document } from '../../../shared/model/Document';
import { Form } from '../../../shared/model/Form';
import { ISuccessEvent } from '../laji-form-document.facade';

@Component({
  selector: 'laji-document-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @Input() formId: string;
  @Input() documentId: string;
  @Input() showHeader = true;
  @Input() showShortcutButton = true;
  @Input() template = false;
  @Output() success = new EventEmitter<ISuccessEvent>();
  @Output() error = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() accessDenied = new EventEmitter();
  @Output() missingNamedplace = new EventEmitter();

  private changeSource = new Subject<any>();
  private changeEvent$ = this.changeSource.asObservable();

  public form: Form.SchemaForm;
  public lang: string;
  public tick = 0;
  public status = '';
  public saveVisibility = 'hidden';
  public saving = false;
  public errorMsg: string;
  public namedPlace;
  public readyForForm = false;

  private publicityRestrictions;

  constructor() {
  }

  canDeactivate(confirmKey = 'haseka.form.discardConfirm') {
    return true;
  }

  onChange(formData) {}

  onLangChange() { }

  onSubmit(event) {}

  submitPublic() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
    this.lajiForm.submit();
  }

  submitPrivate() { }

  fetchForm() { }

  fetchFormAndDocument() { }
}

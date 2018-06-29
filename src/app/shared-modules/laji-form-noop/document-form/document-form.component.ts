import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { Document } from '../../../shared/model/Document';

@Component({
  selector: 'laji-document-form',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @Input() formId: string;
  @Input() documentId: string;
  @Output() onSuccess = new EventEmitter<{document: Document, form: any}>();
  @Output() onError = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onAccessDenied = new EventEmitter();
  @Output() onMissingNamedplace = new EventEmitter();
  @Output() onTmpLoad = new EventEmitter();

  private changeSource = new Subject<any>();
  private changeEvent$ = this.changeSource.asObservable();

  public form: any;
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

  hasChanges() {
    return this.form && this.form.formData && this.form.formData._hasChanges;
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

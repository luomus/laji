import {
  AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { DocumentApi } from '../api/DocumentApi';
import { UserService } from '../service/user.service';
import { FooterService } from '../service/footer.service';
import { LajiFormComponent } from '../form/laji-form.component';
import { FormService } from '../service/form.service';
import { WindowRef } from '../windows-ref';
import { ToastsService } from '../service/toasts.service';
import { Form } from '../model/FormListInterface';
import { Logger } from '../logger/logger.service';
import {NamedPlacesService} from '../../+haseka/named-place/named-places.service';
import { Document } from '../model/Document';
import { DialogService } from '../service/dialog.service';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css']
})
export class DocumentFormComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @Input() formId: string;
  @Input() documentId: string;
  @Output() onSuccess = new EventEmitter<{document: Document, form: any}>();
  @Output() onError = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onTmpLoad = new EventEmitter();

  public form: any;
  public lang: string;
  public tick = 0;
  public status = '';
  public saveVisibility = 'hidden';
  public saving = false;
  public loading = false;
  public enablePrivate = true;
  public errorMsg: string;
  public namedPlace;
  public hasChanges = false;

  private subTrans: Subscription;
  private subFetch: Subscription;
  private subForm: Subscription;
  private success = '';
  private error: any;
  private isEdit = false;
  private leaveMsg;
  private publicityRestrictions;
  private current;

  constructor(private documentService: DocumentApi,
              private formService: FormService,
              private userService: UserService,
              private footerService: FooterService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private namedPlaceService: NamedPlacesService,
              private dialogService: DialogService,
              private logger: Logger) {
  }

  ngAfterViewInit() {
    this.loading = true;
    this.hasChanges = false;
    this.footerService.footerVisible = false;
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
  }

  ngOnChanges() {
    if (!this.formId) {
      return;
    }
    if (this.documentId) {
      this.fetchFormAndDocument();
    } else {
      this.fetchForm();
    }
  }

  ngOnDestroy() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subTrans.unsubscribe();
    this.footerService.footerVisible = true;
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.hasChanges) {
      $event.returnValue = this.leaveMsg;
    }
  }

  onChange(formData) {
    this.saveVisibility = 'shown';
    this.status = 'unsaved';
    this.saving = false;
    this.hasChanges = true;
    this.form['formData'] = formData;
    this.formService
      .store(formData)
      .subscribe();
  }

  onLangChange() {
    this.translate.get('haseka.leave.unsaved')
      .subscribe((msg) => this.leaveMsg = msg);
    if (this.subForm) {
      this.subForm.unsubscribe();
    }
    this.subForm = this.formService
      .getForm(this.formId, this.translate.currentLang)
      .subscribe(form => {
        form['formData'] = this.form.formData;
        this.lang = this.translate.currentLang;
        this.form = form;
      });
  }

  onSubmit(event) {
    this.saving = true;
    this.lajiForm.block();
    const data = event.data.formData;
    data['publicityRestrictions'] = this.publicityRestrictions;
    let doc$;
    if (this.isEdit) {
      doc$ = this.documentService
        .update(data.id || this.documentId, data, this.userService.getToken());
    } else {
      doc$ = this.documentService.create(data, this.userService.getToken());
    }
    doc$.subscribe(
      (result) => {
        this.hasChanges = false;
        this.lajiForm.unBlock();
        this.formService.discard();
        this.formService.setCurrentData(result, true);
        this.translate.get('haseka.form.success')
          .subscribe(value => {
            this.toastsService.showSuccess(value);
          });
        this.onSuccess.emit({document: result, form: this.form});
      },
      (err) => {
        this.lajiForm.unBlock();
        this.saving = false;
        this.saveVisibility = 'shown';
        this.error = this.parseErrorMessage(err);
        this.status = 'unsaved';
        this.logger.error('UNABLE TO SAVE DOCUMENT', {
          data: JSON.stringify(data),
          error: JSON.stringify(err._body)
        });
        this.translate.get('haseka.form.error')
          .subscribe(value => {
            this.toastsService.showError(value);
          });
    });
  }

  submitPublic() {
    this.publicityRestrictions = 'MZ.publicityRestrictionsPublic';
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.publicityRestrictions = 'MZ.publicityRestrictionsPrivate';
    this.lajiForm.submit();
  }

  fetchForm() {
    const key = this.formId + this.translate.currentLang;
    if (this.current === key) {
      return;
    }
    this.current = key;
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService
      .load(this.formId, this.translate.currentLang)
      .subscribe(
        data => {
          this.loading = false;
          this.formService
            .store(data.formData, true)
            .subscribe(id => this.onTmpLoad.emit({
              formID: this.formId,
              tmpID: id
            }));
        },
        err => {
          this.loading = false;
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {formId: this.formId})
            .subscribe(data => this.errorMsg = data);
        }
      );
  }

  fetchFormAndDocument() {
    const key = this.formId + this.translate.currentLang + this.documentId;
    if (this.current === key) {
      return;
    }
    this.current = key;
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.formService
      .load(this.formId, this.translate.currentLang, this.documentId)
      .subscribe(
        data => {
          this.loading = false;
          this.isEdit = true;
          this.enablePrivate = !data.features || data.features.indexOf(Form.Feature.NoPrivate) === -1;
          if (this.formService.isTmpId(this.documentId)) {
            this.isEdit = false;
            this.hasChanges = false;
            data.formData.id = undefined;
            data.formData.hasChanges = undefined;
          }
          if (typeof data.uiSchemaContext === 'undefined') {
            data.uiSchemaContext = {};
          }
          data.uiSchemaContext.activeGatheringIdx = this.isEdit ? null : 0;
          data.uiSchemaContext.formID = this.formId;
          this.form = data;
          this.formService.hasUnsavedData()
            .subscribe(hasChanges => {
              if (hasChanges) {
                this.saveVisibility = 'shown';
                this.status = 'unsaved';
              }
            });
          if (data.formData.namedPlaceID) {
            this.namedPlaceService.getNamedPlace(data.formData.namedPlaceID, this.userService.getToken())
              .subscribe(np => this.namedPlace = np);
          }
          this.lang = this.translate.currentLang;
        },
        err => {
          this.loading = false;
          this.formService.isTmpId(this.documentId) ?
            this.onError.emit(true) :
            this.translate
              .get(err.status === 404 ? 'haseka.form.documentNotFound' : 'haseka.form.genericError', {documentId: this.documentId})
              .subscribe(msg => this.errorMsg = msg);
        }
      );
  }

  private parseErrorMessage(err) {
    let detail = '', data;
    if (err._body) {
      try {
        data = JSON.parse(err._body);
      } catch (e) {}
      detail = data && data.error && data.error.details ?
        data.error.details : '';
    }
    return detail;
  }
}

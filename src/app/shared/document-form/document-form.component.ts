import {
  Component,
  ViewChild,
  Input,
  HostListener,
  OnDestroy,
  AfterViewInit,
  OnChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { DocumentApi } from '../api/DocumentApi';
import { UserService } from '../service/user.service';
import { FooterService } from '../service/footer.service';
import { LajiFormComponent } from '../form/laji-form.component';
import { FormService } from '../service/form.service';
import { WindowRef } from '../windows-ref';
import { ToastsService } from '../service/toasts.service';
import { Form } from '../model/FormListInterface';
import { Logger } from '../logger/logger.service';

@Component({
  selector: 'laji-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css']
})
export class DocumentFormComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @Input() formId: string;
  @Input() documentId: string;
  @Input() tmpPath = '/vihko/{formId}/{id}';
  @Input() donePath = '/vihko';

  public form: any;
  public lang: string;
  public tick = 0;
  public status = '';
  public saveVisibility = 'hidden';
  public saving = false;
  public loading = false;
  public enablePrivate = true;

  private subTrans: Subscription;
  private subFetch: Subscription;
  private subForm: Subscription;
  private success = '';
  private error: any;
  private errorMsg: string;
  private isEdit = false;
  private hasChanges = false;
  private leaveMsg;
  private publicityRestrictions;

  constructor(private documentService: DocumentApi,
              private router: Router,
              private formService: FormService,
              private userService: UserService,
              private footerService: FooterService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private winRef: WindowRef,
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
    if (!this.hasChanges && this.documentId) {
      this.formService.discard();
    }
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
            this.gotoFrontPage();
          },
          (err) => {
            this.lajiForm.unBlock();
            this.saving = false;
            this.saveVisibility = 'shown';
            this.error = this.parseErrorMessage(err);
            this.status = 'error';
            setTimeout(() => {
              if (this.status === 'error') {
                this.status = '';
              }
            }, 5000);
            this.logger.error('UNABLE TO SAVE DOCUMENT', {
              data: data,
              error: this.parseErrorMessage(err)
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

  discard() {
    this.translate.get('haseka.form.discardConfirm').subscribe(
      (confirm) => {
        if (!this.hasChanges) {
          this.gotoFrontPage();
        } else if (this.winRef.nativeWindow.confirm(confirm)) {
          this.formService.discard();
          this.gotoFrontPage();
        }
      }
    );
  }

  fetchForm() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService
      .load(this.formId, this.translate.currentLang)
      .subscribe(
        data => {
          console.log(this.getPathWithParams(this.tmpPath, this.formId, 'T:123'));
          this.loading = false;
          this.formService
            .store(data.formData)
            .subscribe(id => this.router.navigate([
                this.getPathWithParams(this.tmpPath, this.formId, id)
              ],
              {replaceUrl: true}
            ));
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
          this.form = data;
          this.formService.hasUnsavedData()
            .subscribe(hasChanges => {
              if (hasChanges) {
                this.saveVisibility = 'shown';
                this.status = 'unsaved';
              }
            });
          this.lang = this.translate.currentLang;
        },
        err => {
          this.loading = false;
          this.formService.isTmpId(this.documentId) ?
            this.gotoFrontPage() :
            this.translate
              .get(err.status === 404 ? 'haseka.form.documentNotFound' : 'haseka.form.genericError', {documentId: this.documentId})
              .subscribe(msg => this.errorMsg = msg);
        }
      );
  }

  private gotoFrontPage() {
    this.router.navigate([this.getPathWithParams(
      this.donePath,
      this.formId,
      this.documentId
    )]);
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

  private getPathWithParams(path, formId = '', id = '') {
    console.log(path);
    return path
      .replace('{id}', id)
      .replace('{formId}', formId);
  }
}

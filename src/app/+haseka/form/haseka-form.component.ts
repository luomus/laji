import {
  Component,
  OnInit,
  ViewChild,
  trigger,
  state,
  style,
  transition,
  animate,
  HostListener,
  OnDestroy, AfterViewInit
} from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { FooterService } from '../../shared/service/footer.service';
import { LajiFormComponent } from '../../shared/form/laji-form.component';
import { FormService } from './form.service';
import { WindowRef } from '../../shared/windows-ref';
import { ToastsService } from '../../shared/service/toasts.service';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  styleUrls: ['./haseka-form.component.css'],
  animations: [
    trigger('visibilityChanged', [
      state('shown' , style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('shown => hidden', animate('600ms')),
      transition('hidden => shown', animate('300ms'))
    ])
  ]
})
export class HaSeKaFormComponent implements AfterViewInit, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  public form: any;
  public formId: string;
  public documentId: string;
  public lang: string;
  public tick = 0;
  public status = '';
  public saveVisibility = 'hidden';
  public saving = false;
  public loading = false;

  private subParam: Subscription;
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
              private route: ActivatedRoute,
              private router: Router,
              private formService: FormService,
              private userService: UserService,
              private footerService: FooterService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private winRef: WindowRef) {
  }

  ngOnDestroy() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subParam.unsubscribe();
    this.subTrans.unsubscribe();
    this.footerService.footerVisible = true;
    if (!this.hasChanges && this.documentId) {
      this.formService.discard();
    }
  }

  ngAfterViewInit() {
    this.loading = true;
    this.hasChanges = false;
    this.footerService.footerVisible = false;
    this.subParam = this.route.params.subscribe(params => {
      this.formId = params['formId'];
      this.documentId = params['documentId'] || null;
      this.documentId ? this.fetchFormAndDocument() : this.fetchForm();
    });
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
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
          this.formService
            .store(data.formData)
            .subscribe(id => this.router.navigate(
              ['/vihko/' + this.formId + '/' + id]
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
          const msgKey = err.status === 404 ? 'haseka.form.documentNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {documentId: this.documentId})
            .subscribe(data => this.errorMsg = data);
        }
      );
  }

  private gotoFrontPage() {
    this.router.navigate(['/vihko']);
  }

  private parseErrorMessage(err) {
    let detail = '', data;
    if (err._body) {
      try {
        data = JSON.parse(err._body);
      } catch (e) {}
      detail = data && data.error && data.error.detail ?
        data.error.detail : '';
    }
    return detail;
  }
}

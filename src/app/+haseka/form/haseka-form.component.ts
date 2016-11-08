import {
  Component, OnInit, ViewChild, trigger, state, style, transition, animate, Inject,
  HostListener
} from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { FooterService } from '../../shared/service/footer.service';
import { LajiFormComponent } from '../../shared/form/laji-form.component';
import { FormService } from './form.service';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: 'haseka-form.component.html',
  styleUrls: ['haseka-form.component.css'],
  animations: [
    trigger('visibilityChanged', [
      state('shown' , style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('shown => hidden', animate('600ms')),
      transition('hidden => shown', animate('300ms'))
    ])
  ]
})
export class HaSeKaFormComponent implements OnInit {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  public form: any;
  public formId: string;
  public documentId: string;
  public lang: string;
  public tick: number = 0;
  public status: string = '';
  public saveVisibility: string = 'hidden';
  public saving: boolean = false;
  public loading: boolean = false;

  private subParam: Subscription;
  private subTrans: Subscription;
  private subFetch: Subscription;
  private success: string = '';
  private error: any;
  private errorMsg: string;
  private isEdit: boolean = false;
  private window;
  private leaveMsg;
  private publicityRestrictions;

  constructor(private documentService: DocumentApi,
              private route: ActivatedRoute,
              private router: Router,
              private formService: FormService,
              private userService: UserService,
              private footerService: FooterService,
              public translate: TranslateService,
              @Inject('Window') window: Window) {
    this.window = window;
  }

  ngOnDestroy() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subParam.unsubscribe();
    this.subTrans.unsubscribe();
    this.footerService.footerVisible = true;
  }

  ngOnInit() {
    this.loading = true;
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
    if (this.status === 'unsaved') {
      $event.returnValue = this.leaveMsg;
    }
  }

  onChange(formData) {
    this.saveVisibility = 'shown';
    this.status = 'unsaved';
    this.saving = false;
    this.formService.store(formData);
  }

  onLangChange() {
    this.translate.get('haseka.leave.unsaved')
      .subscribe((msg) => this.leaveMsg = msg);
    this.documentId ? this.fetchFormAndDocument() : this.fetchForm();
  }

  onSubmit(event) {
    this.saving = true;
    let data = event.data.formData;
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
            this.formService.discard();
            this.formService.setCurrentData(result, true);
            this.translate.get('haseka.form.success')
              .subscribe(value => this.formService.setSuccessMessage(value));
            this.gotoFrontPage();
          },
          (err) => {
            this.saving = false;
            this.saveVisibility = 'shown';
            this.error = this.parseErrorMessage(err);
            this.status = 'error';
            setTimeout(() => {
              if (this.status === 'error') {
                this.status = ''
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
        if (this.window.confirm(confirm)) {
          this.formService.discard();
          if (this.formService.isTmpId(this.documentId)) {
            this.gotoFrontPage();
          } else {
            this.form.formData = this.formService.getDataWithoutChanges();
            this.status = '';
            this.saveVisibility = 'hidden';
            this.tick = this.tick + 1;
          }
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
          this.isEdit = false;
          this.form = data;
          this.lang = this.translate.currentLang;
          this.loading = false;
        },
        err => {
          this.loading = false;
          let msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
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
          this.isEdit = true;
          if (this.formService.isTmpId(this.documentId)) {
            this.isEdit = false;
            data.formData.id = undefined;
            data.formData.hasChanges = undefined;
          }
          this.form = data;
          if (this.formService.hasUnsavedData()) {
            this.saveVisibility = 'shown';
            this.status = 'unsaved';
          }
          this.lang = this.translate.currentLang;
          this.loading = false;
        },
        err => {
          this.loading = false;
          let msgKey = err.status === 404 ? 'haseka.form.documentNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {documentId: this.documentId})
            .subscribe(data => this.errorMsg = data);
        }
      );
  }

  private gotoFrontPage() {
    this.router.navigate(['/record']);
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

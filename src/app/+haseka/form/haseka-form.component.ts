import { Component, OnInit, ViewChild, trigger, state, style, transition, animate, Inject } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { FooterService } from '../../shared/service/footer.service';
import { FormApi } from '../../shared/api/FormApi';
import { LajiFormComponent } from '../../shared/form/laji-form.component';
import { LocalStorage } from 'angular2-localstorage/dist';
import { Util } from '../../shared/service/util.service';
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
  private isEdit: boolean = false;
  private window;

  constructor(private documentService: DocumentApi,
              private route: ActivatedRoute,
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
      () => this.documentId ? this.fetchFormAndDocument() : this.fetchForm()
    );
  }

  onChange(formData) {
    this.saveVisibility = 'shown';
    this.status = 'unsaved';
    this.saving = false;
    this.formService.store(formData);
  }

  onSubmit(event) {
    this.saving = true;
    let data = event.data.formData;
    let doc$;
    if (this.isEdit) {
      doc$ = this.documentService
        .update(data.id || this.documentId, data, this.userService.getToken());
    } else {
      doc$ = this.documentService.create(data, this.userService.getToken());
    }
    doc$.subscribe(
          (result) => {
            this.tick = this.tick + 1;
            this.status = 'success';
            this.form.formData = result;
            this.documentId = result.id;
            this.lajiForm.clearState();
            setTimeout(() => {
              this.saveVisibility = 'hidden';
              this.status = '';
            }, 5000);
            this.formService.discard();
            this.isEdit = true;
          },
          (err) => {
            this.saving = false;
            this.saveVisibility = 'shown';
            this.error = this.parseErrorMessage(err);
            this.status = 'error';
            setTimeout(() => this.status = '', 5000);
        });
  }

  submit() {
    this.lajiForm.submit();
  }

  discard() {
    this.translate.get('haseka.form.discardConfirm').subscribe(
      (confirm) => {
        if (this.window.confirm(confirm)) {
          this.formService.discard();
          this.form.formData = this.formService.getDataWithoutChanges();
          this.status = '';
          this.saveVisibility = 'hidden';
          this.tick = this.tick + 1;
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
          console.log(data);
          this.isEdit = false;
          this.form = data;
          if (this.formService.hasUnsavedData()) {
            this.saveVisibility = 'shown';
            this.status = 'unsaved';
          }
          this.lang = this.translate.currentLang;
          this.loading = false;
        },
        err => console.log(err)
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
          this.form = data;
          if (this.formService.hasUnsavedData()) {
            this.saveVisibility = 'shown';
            this.status = 'unsaved';
          }
          this.lang = this.translate.currentLang;
          this.loading = false;
        },
        err => console.log(err)
      );
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

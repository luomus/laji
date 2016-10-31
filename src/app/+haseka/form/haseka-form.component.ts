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

@Component({
  selector: 'laji-haseka-form',
  templateUrl: 'haseka-form.component.html',
  providers: [FormApi, DocumentApi],
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

  @LocalStorage() private formDataStorage = {};
  private subParam: Subscription;
  private subTrans: Subscription;
  private subFetch: Subscription;
  private success: string = '';
  private error: any;
  private isEdit: boolean = false;
  private origFormData: any;
  private window;

  constructor(private formService: FormApi,
              private documentService: DocumentApi,
              private route: ActivatedRoute,
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
    if (this.isEdit) {
      this.formDataStorage[this.documentId] = formData;
    } else {
      this.formDataStorage[this.formId] = formData;
    }
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
            let deleteKey = this.isEdit ? this.documentId : this.formId;
            delete this.formDataStorage[deleteKey];
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
          let deleteKey = this.isEdit ? this.documentId : this.formId;
          delete this.formDataStorage[deleteKey];
          this.form.formData = this.origFormData;
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
    this.subFetch = Observable.forkJoin(
      this.formService.formFindById(this.formId, this.translate.currentLang),
      this.userService.getDefaultFormData()
    ).subscribe(
      data => {
        this.isEdit = false;
        data[0].formData = data[1];
        this.origFormData = Util.clone(data[1]);
        this.form = data[0];
        if (this.formDataStorage[this.formId]) {
          this.saveVisibility = 'shown';
          this.status = 'unsaved';
          this.form.formData = this.formDataStorage[this.formId];
        }
        this.lang = this.translate.currentLang;
      },
      err => console.log(err)
    );
  }

  fetchFormAndDocument() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    Observable.forkJoin([
      this.formService.formFindById(this.formId, this.translate.currentLang),
      this.documentService.findById(this.documentId, this.userService.getToken())
    ]).subscribe(
      data => {
        this.isEdit = true;
        this.form = data[0];
        this.form.formData = data[1];
        this.origFormData = Util.clone(data[1]);
        if (this.formDataStorage[this.documentId] && this.isLocalNewest(
            this.formDataStorage[this.documentId],
            this.form.formData
          )) {
          this.saveVisibility = 'shown';
          this.status = 'unsaved';
          this.form.formData = this.formDataStorage[this.documentId];
        }
        this.lang = this.translate.currentLang;
      },
      err => console.log(err)
    );
  }

  isLocalNewest(local, remote) {
    if (remote.dateEdited) {
      if (!local.dateEdited ||
        this.getDateFromString(local.dateEdited) < this.getDateFromString(remote.dateEdited)) {
        return false;
      }
    }
    return true;
  }

  private getDateFromString(dateString) {
    const reggie = /(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
    let dateArray = reggie.exec(dateString);
    return new Date(
      (+dateArray[1]),
      (+dateArray[2]) - 1, // Careful, month starts at 0!
      (+dateArray[3]),
      (+dateArray[4]),
      (+dateArray[5]),
      (+dateArray[6])
    );
  }

  private parseErrorMessage(err) {
    let detail = '', data;
    if (err._body) {
      try {
        data = JSON.parse(err._body);
      } catch (e) {}
      detail = data && data.error && data.error.message && data.error.message.detail ?
        data.error.message.detail : '';
    }
    return detail;
  }
}

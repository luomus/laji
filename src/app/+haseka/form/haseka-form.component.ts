import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';
import { FooterService } from '../../shared/service/footer.service';
import { FormApi } from '../../shared/api/FormApi';
import { LajiFormComponent } from '../../shared/form/laji-form.component';
import { LocalStorage } from 'angular2-localstorage/dist';

@Component({
  selector: 'laji-haseka-form',
  templateUrl: 'haseka-form.component.html',
  providers: [FormApi, DocumentApi],
  styleUrls: ['haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;

  public form: any;
  public formId: string;
  public documentId: string;
  public lang: string;
  public tick: number = 0;

  @LocalStorage() private formDataStorage = {};
  private subParam: Subscription;
  private subTrans: Subscription;
  private subFetch: Subscription;
  private success: string = '';
  private error: any;
  private isEdit: boolean = false;

  constructor(private formService: FormApi,
              private documentService: DocumentApi,
              private route: ActivatedRoute,
              private userService: UserService,
              private footerService: FooterService,
              public translate: TranslateService) {
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
    if (this.isEdit) {
      this.formDataStorage[this.documentId] = formData;
    } else {
      this.formDataStorage[this.formId] = formData;
    }
  }

  onSubmit(event) {
    let data = event.data.formData;
    let edit$ = this.documentService
      .update(data.id || this.documentId, data, this.userService.getToken());
    let create$ = this.documentService
      .create(data, this.userService.getToken());
    (this.isEdit ? edit$ : create$)
        .subscribe(
          (result) => {
            this.tick = this.tick + 1;
            this.success = 'haseka.form.success';
            this.form.formData = result;
            this.documentId = result.id;
            this.lajiForm.clearState();
            setTimeout(() => this.success = '', 5000);
            if (this.isEdit) {
              delete this.formDataStorage[this.formId];
            } else {
              delete this.formDataStorage[this.documentId];
            }
            this.isEdit = true;
          },
          (err) => {
            this.error = this.parseErrorMessage(err);
            setTimeout(() => this.error = undefined, 5000);
        });
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
        data[0].formData = data[1];
        this.form = data[0];
        if (this.formDataStorage[this.formId]) {
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
        if (this.formDataStorage[this.documentId] && this.isLocalNewest(
            this.formDataStorage[this.documentId],
            this.form.formData
          )) {
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
    let detail = '';
    if (err._body) {
      let data = JSON.parse(err._body);
      detail = data && data.error && data.error.message && data.error.message.detail ?
        data.error.message.detail : '';
    }
    return {
      title: 'haseka.form.failure',
      detail: detail
    };
  }
}

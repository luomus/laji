import {Component, OnInit, ElementRef, Inject, OnDestroy } from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Subscription, Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";

import {LajiFormComponent, FormApi} from "../../shared";
import {DocumentApi} from "../../shared/api/DocumentApi";
import {UserService} from "../../shared/service/user.service";
import {AlertComponent} from "ng2-bootstrap";

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  providers: [ FormApi, DocumentApi ],
  styleUrls: ['./haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit {

  private formDataStorage = {};

  public form:any;
  public formId:string;
  public documentId:string;
  public lang:string;

  private subParam:Subscription;
  private subTrans:Subscription;
  private subFetch:Subscription;
  private success:string = '';
  private error:any;
  private isEdit:boolean = false;

  constructor(
    private formService:FormApi,
    private documentService:DocumentApi,
    private route: ActivatedRoute,
    private userService: UserService,
    public translate: TranslateService
  ) {
  }

  ngOnDestroy() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subParam.unsubscribe();
    this.subTrans.unsubscribe();
  }

  ngOnInit() {
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
    if (!this.isEdit) {
      this.formDataStorage[this.formId] = formData;
    }
  }

  onSubmit(formData) {
    let data = formData.formData;
    if (this.isEdit) {
      this.documentService
        .update(data.id || this.documentId,data, this.userService.getToken())
        .subscribe(
          data => {
            this.success = 'haseka.form.success';
            setTimeout(() => this.success = '', 5000)
          },
          err => {
            this.error = err;
            setTimeout(() => this.error = undefined, 5000)
          }
        );
    } else {
      this.documentService
        .create(data, this.userService.getToken())
        .subscribe(
          data => {
            this.success = 'haseka.form.success';
            this.form.formData = data;
            this.documentId = data.id;
            this.isEdit = true;
            this.formDataStorage[this.formId] = {};
            setTimeout(() => this.success = '', 5000)
          },
          err => {
            this.error = this.parseErrorMessage(err);
            setTimeout(() => this.error = undefined, 5000)
          }
        );
    }
  }

  private parseErrorMessage(err) {
    let detail = '';
    if (err._body) {
      let data = JSON.parse(err._body);
      console.log(data);
      detail = data && data.error && data.error.message && data.error.message.detail ?
        data.error.message.detail : '';
    }
    return {
      title: 'haseka.form.failure',
      detail: detail
    };
  }

  fetchForm() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = Observable.forkJoin(
      this.formService.formFindById(this.formId, this.translate.currentLang),
      this.userService.getDefaultFormData()
    ).subscribe(
        data =>  {
          data[0].formData = data[1];
          this.form = data[0];
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
      this.formService.formFindById(this.formId),
      this.documentService.findById(this.documentId, this.userService.getToken())
    ]).subscribe(
      data => {
        this.isEdit = true;
        this.form = data[0];
        this.form.formData = data[1];
        this.formDataStorage[this.formId] = this.form.formData;
        this.lang = this.translate.currentLang;
      },
      err => console.log(err)
    );
  }

}

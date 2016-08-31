import {Component, OnInit, ElementRef, Inject, OnDestroy } from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Subscription, Observable} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import { LocalStorage } from "angular2-localstorage/WebStorage";

import {LajiFormComponent, FormApi} from "../../shared";
import {DocumentApi} from "../../shared/api/DocumentApi";
import {UserService} from "../../shared/service/user.service";

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  directives: [ LajiFormComponent ],
  providers: [ FormApi, DocumentApi ],
  styleUrls: ['./haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit {

  @LocalStorage() private formDataStorage = {};

  public form:any;
  public formId:string;
  public documentId:string;
  public lang:string;

  private subParam:Subscription;
  private subTrans:Subscription;
  private subFetch:Subscription;

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
    this.formDataStorage[this.formId] = formData;
  }

  onSubmit(formData) {
    delete this.formDataStorage[this.formId];
  }

  fetchForm() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService
      .formFindById(this.formId, this.translate.currentLang)
      .subscribe(
        form =>  {
          if (this.formDataStorage[this.formId]) {
            form.formData = this.formDataStorage[this.formId];
          }
          this.form = form;
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
        this.form = data[0];
        this.form.formData = data[1];
        this.formDataStorage[this.formId] = this.form.formData;
        this.lang = this.translate.currentLang;
      },
      err => console.log(err)
    );
  }

}

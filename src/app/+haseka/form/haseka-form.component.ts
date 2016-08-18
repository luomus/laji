import {Component, OnInit, ElementRef, Inject, OnDestroy } from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import { LocalStorage } from "angular2-localstorage/WebStorage";

import {LajiFormComponent, FormApi} from "../../shared";

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  directives: [ LajiFormComponent ],
  providers: [ FormApi ],
  styleUrls: ['./haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit {

  @LocalStorage() private formStorage = {};

  public form:any;
  public formId:string;
  public lang:string;

  private subParam:Subscription;
  private subTrans:Subscription;
  private subFetch:Subscription;

  constructor(
    private route: ActivatedRoute,
    private formService:FormApi,
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
      this.updateForm();
    });
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.updateForm()
    );
  }

  onChange(formData) {
    this.formStorage[this.formId] = formData;
  }

  onSubmit(formData) {
    console.log('saving data');
    console.log(formData);
    delete this.formStorage[this.formId];
  }

  updateForm() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService
      .formFindById(this.formId, this.translate.currentLang)
      .subscribe(
        data =>  {
          if (this.formStorage[this.formId]) {
            data.formData = this.formStorage[this.formId];
          }
          this.form = data;
          this.lang = this.translate.currentLang;
        },
        err => console.log(err)
      );
  }

}

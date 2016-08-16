import {Component, OnInit, ElementRef, Inject, OnDestroy } from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";

import {LajiFormComponent, FormApi} from "../../shared";

@Component({
  selector: 'laji-haseka-form',
  templateUrl: './haseka-form.component.html',
  directives: [ LajiFormComponent ],
  providers: [ FormApi ],
  styleUrls: ['./haseka-form.component.css']
})
export class HaSeKaFormComponent implements OnInit {

  public form:any;
  public formId:string;

  private subParam:Subscription;
  private subTrans:Subscription;
  private subFetch:Subscription;

  constructor(
    private route: ActivatedRoute,
    private formService:FormApi,
    private translate: TranslateService
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
      this.fetchFormInstructions();
    });
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.fetchFormInstructions()
    );
  }

  onChange(value) {
    console.log(value);
  }

  onSubmit(data) {
    console.log(data);
  }


  fetchFormInstructions() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService
      .formFindById(this.formId, this.translate.currentLang)
      .subscribe(
        data => this.form = data,
        err => console.log(err)
      );
  }

}

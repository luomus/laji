import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { FormListInterface } from '../../shared/model/FormListInterface';
import { FormService } from '../form/form.service';

@Component({
  selector: 'laji-haseka-form-list',
  templateUrl: 'haseka-form-list.component.html'
})
export class HaSeKaFormListComponent implements OnInit, OnDestroy {

  public formList: FormListInterface[] = [];
  private subTrans: Subscription;
  private subFetch: Subscription;

  constructor(private formService: FormService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.updateForms();
      }
    );
    this.updateForms();
  }

  ngOnDestroy() {
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
  }

  updateForms() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService.getAllForms(this.translate.currentLang)
      .subscribe(
        forms => this.formList = forms,
        err => console.log(err)
      );
  }

}

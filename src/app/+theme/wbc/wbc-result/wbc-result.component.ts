import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../../shared/service/form.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'laji-wbc-result',
  templateUrl: './wbc-result.component.html',
  styleUrls: ['./wbc-result.component.css']
})
export class WbcResultComponent implements OnInit {
  formLogo: string;

  constructor(
    private translate: TranslateService,
    private formService: FormService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formService
      .getForm(environment.wbcForm, this.translate.currentLang)
      .subscribe(form => {
        this.formLogo = form.logo;
        this.cd.markForCheck();
      });
  }
}

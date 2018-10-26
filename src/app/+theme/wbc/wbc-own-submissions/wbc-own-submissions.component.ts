import { Component, OnInit } from '@angular/core';
import { Global } from '../../../../environments/global';
import { environment } from '../../../../environments/environment';
import { Observable, of as ObservableOf } from 'rxjs';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-wbc-own-submissions',
  templateUrl: './wbc-own-submissions.component.html',
  styleUrls: ['./wbc-own-submissions.component.css']
})
export class WbcOwnSubmissionsComponent implements OnInit {

  collectionID = Global.collections.wbc;
  rights: Observable<Rights>;

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.rights = this.formService.getForm(environment.wbcForm, this.translateService.currentLang)
      .switchMap(form => this.formPermissionService.getRights(form))
      .catch(() => ObservableOf({edit: false, admin: false}))
  }

}

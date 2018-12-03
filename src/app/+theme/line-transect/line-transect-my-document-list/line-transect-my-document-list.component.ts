
import {catchError, switchMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Global } from '../../../../environments/global';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { Observable, of as ObservableOf } from 'rxjs';

@Component({
  selector: 'laji-line-transect-my-document-list',
  templateUrl: './line-transect-my-document-list.component.html',
  styleUrls: ['./line-transect-my-document-list.component.css']
})
export class LineTransectMyDocumentListComponent implements OnInit {

  collectionID = Global.collections.lineTransect;
  rights: Observable<Rights>;

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.rights = this.formService.getForm(environment.wbcForm, this.translateService.currentLang).pipe(
      switchMap(form => this.formPermissionService.getRights(form))).pipe(
      catchError(() => ObservableOf({edit: false, admin: false})));
  }

}

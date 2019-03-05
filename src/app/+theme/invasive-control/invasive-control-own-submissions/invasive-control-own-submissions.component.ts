
import {catchError, switchMap} from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Global } from '../../../../environments/global';
import { environment } from '../../../../environments/environment';
import { Observable, of as ObservableOf } from 'rxjs';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-invasive-control-own-submissions',
  templateUrl: './invasive-control-own-submissions.component.html',
  styleUrls: ['./invasive-control-own-submissions.component.css']
})
export class InvasiveControlOwnSubmissionsComponent implements OnInit {

  collectionID = Global.collections.invasiveControl;
  rights: Observable<Rights>;
  useLocalDocumentViewer = false;
  gatheringGeometryJSONPath;

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.rights = this.formService.getForm(environment.invasiveControlForm, this.translateService.currentLang).pipe(
      switchMap(form => {
        const {namedPlaceOptions = {}} = form;
        this.useLocalDocumentViewer = !!namedPlaceOptions.documentListUseLocalDocumentViewer;
        this.gatheringGeometryJSONPath = namedPlaceOptions.documentViewerGatheringGeometryJSONPath;
        return this.formPermissionService.getRights(form);
      })).pipe(
      catchError(() => ObservableOf({edit: false, admin: false})));
  }

}


import { catchError } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { FormService } from '../../../shared/service/form.service';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeFormService } from '../theme-form.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'laji-theme-own-submissions',
  templateUrl: './theme-own-submissions.component.html',
  styleUrls: ['./theme-own-submissions.component.scss']
})
export class ThemeOwnSubmissionsComponent implements OnInit {

  collectionID: string;
  rights$: Observable<Rights>;
  useLocalDocumentViewer = false;
  gatheringGeometryJSONPath;
  columns = ['dateEdited', 'dateObserved', 'taxon', 'namedPlaceName', 'observer', 'id'];
  actions = ['edit', 'view', 'download', 'stats', 'delete'];

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService,
    private themeFormService: ThemeFormService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.themeFormService.getForm(this.route).subscribe(form => {
    this.collectionID = form.collectionID;
    const {options = {}, namedPlaceOptions = {}} = form;
    if (options.ownSubmissionsColumns) {
      this.columns = options.ownSubmissionsColumns;
      this.actions = options.ownSubmissionsActions;
    }
    this.useLocalDocumentViewer = !!namedPlaceOptions.documentListUseLocalDocumentViewer;
    this.gatheringGeometryJSONPath = namedPlaceOptions.documentViewerGatheringGeometryJSONPath;

    this.rights$ = this.formPermissionService.getRights(form).pipe(
      catchError(() => ObservableOf({edit: false, admin: false})));
    });
  }

}


import { map, mergeMap, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormPermissionService, Rights } from '../../shared/service/form-permission.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectFormService } from '../../shared/service/project-form.service';

interface ViewModel {
  collectionID: string;
  columns: string[];
  actions: string[];
  useLocalDocumentViewer: boolean;
  rights: Rights;
  title?: string;
}

@Component({
    selector: 'laji-submissions',
    templateUrl: './submissions.component.html',
    styleUrls: ['./submissions.component.scss'],
    standalone: false
})
export class SubmissionsComponent implements OnInit {

  collectionID!: string;
  vm$!: Observable<ViewModel | undefined>;

  constructor(
    private formPermissionService: FormPermissionService,
    private projectFormService: ProjectFormService,
    protected route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.vm$ = this.projectFormService.getFormFromRoute$(this.route).pipe(
      mergeMap(form => !form ? of(undefined) : this.formPermissionService.getRights(form).pipe(
        map(rights => ({
            rights,
            collectionID: form.collectionID,
            columns: form.options?.ownSubmissionsColumns || ['dateEdited', 'dateObserved', 'taxon', 'namedPlaceName', 'observer', 'id'],
            actions: form.options?.ownSubmissionsActions || ['edit', 'view', 'download', 'stats', 'delete'],
            useLocalDocumentViewer: !!form.options?.namedPlaceOptions?.documentListUseLocalDocumentViewer,
            title: this.projectFormService.getSubmissionsPageTitle(form, rights.admin)
          })
        )
      ))
    ) as Observable<ViewModel>;
  }

}

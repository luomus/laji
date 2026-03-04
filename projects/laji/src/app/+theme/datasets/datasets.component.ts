import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { forkJoin, Observable } from 'rxjs';
import { Global } from '../../../environments/global';
import { map, switchMap } from 'rxjs';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../../shared-modules/breadcrumb/theme-breadcrumb/theme-breadcrumb.component';
import { MultiLanguage } from '../../shared/model/MultiLanguage';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type FormListing = components['schemas']['FormListing'];

@Component({
    selector: 'laji-generic-collections',
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DatasetsComponent {

  readonly breadcrumb$: Observable<Breadcrumb[]>;
  readonly forms$: Observable<FormListing[]>;
  instructions: MultiLanguage = {
    fi: '3513',
    en: '3517',
    sv: '3520'
  };

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private route: ActivatedRoute,
  ) {
    this.breadcrumb$ = this.route.data.pipe(
      map(data => data.breadcrumbs || [])
    );

    this.forms$ = this.formService.getAllForms().pipe(
      switchMap(fs => forkJoin(
        fs.filter(f =>
          f.options?.dataset && ![Global.forms.databankPrimary, Global.forms.databankSecondary].includes(f.id)
        ).map(f => this.formPermissionService.getRights(f).pipe(
          map(rights => (rights.view || rights.ictAdmin) && f),
        ))
      ).pipe(
        map(_fs => _fs.filter(f => f) as FormListing[]),
      )),
    );
  }

}

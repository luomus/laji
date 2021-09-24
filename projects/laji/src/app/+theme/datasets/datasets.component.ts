import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { from, Observable } from 'rxjs';
import { Global } from '../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, filter, map, switchMap, toArray } from 'rxjs/operators';
import { MultiLanguage } from '../../../../../laji-api-client/src/lib/models';
import { Form } from '../../shared/model/Form';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { UserService } from '../../shared/service/user.service';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../../shared-modules/breadcrumb/theme-breadcrumb/theme-breadcrumb.component';

@Component({
  selector: 'laji-generic-collections',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetsComponent {

  readonly breadcrumb$: Observable<Breadcrumb[]>;
  readonly forms$: Observable<Form.List[]>;
  instructions: MultiLanguage = {
    fi: '3513',
    en: '3517',
    sv: '3520'
  };

  constructor(
    private formService: FormService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private formPermissionService: FormPermissionService,
    private userService: UserService,
    private route: ActivatedRoute,
  ) {
    this.breadcrumb$ = this.route.data.pipe(
      map(data => data.breadcrumbs || [])
    );

    this.forms$ = this.formService.getAllForms().pipe(
      switchMap(forms => from(
        forms.filter(f => f.options?.dataset && ![Global.forms.datasetPrimary, Global.forms.datasetSecondary].includes(f.id))
      ).pipe(
        concatMap(f => this.formPermissionService.getRights(f).pipe(
          map(rights => (rights.view || rights.ictAdmin) && f),
          filter(_f => !!_f),
          toArray()
        ))
      )),
    );
  }

}

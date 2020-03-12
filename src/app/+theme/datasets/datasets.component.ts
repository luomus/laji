import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormService } from '../../shared/service/form.service';
import { from, Observable, of } from 'rxjs';
import { Global } from '../../../environments/global';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, filter, map, switchMap, take, tap, toArray } from 'rxjs/operators';
import { MultiLanguage } from '../../../../projects/laji-api-client/src/lib/models';
import { Form } from '../../shared/model/Form';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { UserService } from '../../shared/service/user.service';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from '../common/monitoring-theme-base.component';

@Component({
  selector: 'laji-generic-collections',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetsComponent {

  readonly breadcrumb$: Observable<Breadcrumb[]>;
  readonly forms$: Observable<Form.List[]>;
  instructions: MultiLanguage;
  features = Form.Feature;

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
    this.forms$ = this.formService.getForm(Global.forms.datasets, this.translateService.currentLang).pipe(
      tap(form => {
        this.instructions = form.instructions;
        this.cdr.detectChanges();
      }),
      switchMap(form => this.formService.getAllForms(this.translateService.currentLang).pipe(
        switchMap((forms) => from(form.options.forms).pipe(
          map(id => forms.find(f => f.id === id)),
          concatMap(f => this.userService.user$.pipe(
            take(1),
            concatMap(person => UserService.isIctAdmin(person) ? of(f) : this.formPermissionService.hasAccessToForm(f && f.id || null).pipe(
              map((access) => access ? f : null)
            ))
          )),
          filter(f => !!f),
          toArray()
        ))
      )
    ));
  }

}

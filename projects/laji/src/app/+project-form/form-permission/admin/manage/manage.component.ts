import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';
import { FormPermission } from '../../../../shared/model/FormPermission';
import { UserService } from '../../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { AbstractPermission } from '../abstract-permission';
import { ProjectFormService } from '../../../../shared/service/project-form.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageComponent extends AbstractPermission implements OnInit, OnDestroy {
  disabled: {[personId: string]: boolean} = {};
  type: string;

  private subParam: Subscription;

  constructor(
    protected router: Router,
    protected formPermissionService: FormPermissionService,
    protected localizeRouterService: LocalizeRouterService,
    protected userService: UserService,
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.subParam = this.projectFormService.getFormFromRoute$(this.route).pipe(
      mergeMap(form => this.route.params.pipe(map(params =>
        [form.collectionID, params['type'] || 'editors']
      ))),
      tap(([collectionId, type]) => {
        this.collectionId = collectionId;
        this.type = type;
      }),
      switchMap(() => this.updateFormPermission$())
    ).subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  makePermissionChange(personId: string, action: 'acceptAdmin' | 'acceptEditor' | 'reject') {
    if (action === 'acceptAdmin' && !confirm(this.translate.instant('form.permission.admin.confirmAdmin', { personId }))) {
      return;
    }
    this.disabled[personId] = true;
    const cb = () => {
      this.disabled[personId] = false;
      this.cdr.markForCheck();
    };

    const method = (action === 'acceptAdmin' || action === 'acceptEditor') ? 'acceptRequest' : 'revokeAccess';
    this.formPermissionService[method](this.collectionId, this.userService.getToken(), personId, action === 'acceptAdmin' ? FormPermission.Type.Admin : undefined).pipe(
      switchMap(() => this.updateFormPermission$())
    ).subscribe(cb, cb);
  }
}

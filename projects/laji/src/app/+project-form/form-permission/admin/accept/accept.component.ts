import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';
import { UserService } from '../../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { AbstractPermission } from '../abstract-permission';
import { ProjectFormService } from '../../../../shared/service/project-form.service';
import { TranslateService } from '@ngx-translate/core';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'laji-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptComponent extends AbstractPermission implements OnInit, OnDestroy {
  disabled: {[personId: string]: boolean} = {};

  private subParam!: Subscription;

  constructor(
    protected router: Router,
    protected formPermissionService: FormPermissionService,
    protected localizeRouterService: LocalizeRouterService,
    protected userService: UserService,
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { super(); }

  ngOnInit() {
    this.subParam = this.projectFormService.getFormFromRoute$(this.route).pipe(
      tap(form => this.collectionId = form.collectionID as string),
      switchMap(() => this.updateFormPermission$())
    ).subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  makePermissionChange(personId: string, action: 'accept' | 'reject') {
    this.disabled[personId] = true;
    const cb = () => {
      this.disabled[personId] = false;
      this.cdr.markForCheck();
    };

    const method = action === 'accept' ? 'acceptRequest' : 'revokeAccess';
    this.formPermissionService[method](this.collectionId, this.userService.getToken(), personId).pipe(
      switchMap(() => this.updateFormPermission$())
    ).subscribe(cb, cb);
  }

  selectPerson(event: any) {
    if (confirm(this.translate.instant('form.permission.admin.confirmAccess', { fullName: event.fullName }))) {
      this.makePermissionChange(event.id, 'accept');
    }
  }
}

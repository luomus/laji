import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';
import { UserService } from '../../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { AbstractPermission } from '../abstract-permission';
import { ProjectFormService } from '../../../project-form.service';
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
  ) { super(); }

  ngOnInit() {
    this.subParam = this.projectFormService.getFormFromRoute$(this.route).pipe(
      tap(form => this.collectionId = form.collectionID),
      switchMap(() => this.updateFormPermission$())
    ).subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  accept(personId: string) {
    this.disabled[personId] = true;
    this.formPermissionService.acceptRequest(this.collectionId, this.userService.getToken(), personId).pipe(
      switchMap(() => this.updateFormPermission$())
    ).subscribe(() => {
      this.disabled[personId] = false;
      this.cdr.markForCheck();
    });
  }

  reject(personId: string) {
    this.disabled[personId] = true;
    this.formPermissionService.revokeAccess(this.collectionId, this.userService.getToken(), personId).pipe(
      switchMap(() => this.updateFormPermission$())
    ).subscribe(() => {
      this.disabled[personId] = false;
      this.cdr.markForCheck();
    });
  }

  selectPerson(event) {
    if (confirm(this.translate.instant('form.permission.admin.confirmAccess', { fullName: event.fullName }))) {
      this.accept(event.id);
    }
  }
}

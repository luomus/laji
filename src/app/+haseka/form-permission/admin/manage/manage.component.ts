
import { map } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest as ObservableCombineLatest, Subscription } from 'rxjs';
import { FormPermissionService } from '../../form-permission.service';
import { FormPermission } from '../../../../shared/model/FormPermission';
import { UserService } from '../../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { AbstractPermission } from '../abstract-permission';

@Component({
  selector: 'laji-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent extends AbstractPermission implements OnInit, OnDestroy {

  type: string;

  private subParam: Subscription;

  constructor(
    protected router: Router,
    protected formPermissionService: FormPermissionService,
    protected localizeRouterService: LocalizeRouterService,
    protected userService: UserService,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.subParam = ObservableCombineLatest(
      this.route.parent.params,
      this.route.params
    ).pipe(
      map(data => ({...data[0], ...data[1]}))
    ).subscribe(params => {
      this.collectionId = params['collectionId'];
      this.type = params['type'] || 'editors';
      this.initFormPermission();
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  makeEditor(personId: string) {
    this.formPermissionService.acceptRequest(this.collectionId, this.userService.getToken(), personId)
      .subscribe(() => this.initFormPermission());
  }

  makeAdmin(personId: string) {
    if (confirm('Oletko varma että haluat tehdä ' + personId + ':stä adminin?')) {
      this.formPermissionService
        .acceptRequest(this.collectionId, this.userService.getToken(), personId, FormPermission.Type.Admin)
        .subscribe(() => this.initFormPermission());
    }

  }

  reject(personId: string) {
    this.formPermissionService.revokeAccess(this.collectionId, this.userService.getToken(), personId)
      .subscribe(() => this.initFormPermission());
  }
}

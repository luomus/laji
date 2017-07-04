import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormPermissionService } from '../../form-permission.service';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { FormPermission } from '../../../../shared/model/FormPermission';
import { UserService } from '../../../../shared/service/user.service';
import { Logger } from '../../../../shared/logger/logger.service';
import { Person } from '../../../../shared/model/Person';
import { Observable } from 'rxjs/Observable';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';

@Component({
  selector: 'laji-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit, OnDestroy {

  formPermission: FormPermission;
  isAllowed = false;
  collectionId: string;
  type: string;

  private subParam: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formPermissionService: FormPermissionService,
    private localizeRouterService: LocalizeRouterService,
    private toastsService: ToastsService,
    private userService: UserService,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.subParam = Observable.combineLatest(
      this.route.parent.params,
      this.route.params,
      (parent, current) => ({...parent, ...current})
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

  private initFormPermission() {
    if (!this.collectionId) {
      return;
    }
    this.formPermissionService
      .getFormPermission(this.collectionId, this.userService.getToken())
      .combineLatest(
        this.userService.getUser(),
        (permission, person) => ({permission, person})
      )
      .subscribe((data) => {
        this.formPermission = data.permission;
        this.isAllowed = this.formPermissionService.isAdmin(data.permission, data.person);
        if (!this.isAllowed) {
          this.router.navigate(
            this.localizeRouterService.translateRoute(['/vihko'])
          );
        }
      });
  }

}

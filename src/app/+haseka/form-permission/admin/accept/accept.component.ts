
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../../form-permission.service';
import { UserService } from '../../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { AbstractPermission } from '../abstract-permission';

@Component({
  selector: 'laji-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent extends AbstractPermission implements OnInit, OnDestroy {

  private subParam: Subscription;

  constructor(
    protected router: Router,
    protected formPermissionService: FormPermissionService,
    protected localizeRouterService: LocalizeRouterService,
    protected userService: UserService,
    private route: ActivatedRoute
  ) { super(); }

  ngOnInit() {
    this.subParam = this.route.parent.params.subscribe(params => {
      this.collectionId = params['collectionId'];
      this.initFormPermission();
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  accept(personId: string) {
    this.formPermissionService.acceptRequest(this.collectionId, this.userService.getToken(), personId)
      .subscribe(
        () => this.initFormPermission()
      );
  }

  reject(personId: string) {
    this.formPermissionService.revokeAccess(this.collectionId, this.userService.getToken(), personId)
      .subscribe(
        () => this.initFormPermission()
      );
  }

  selectPerson(event) {
    if (confirm('Oletko varma että haluat antaa oikeudet lomakkeeseen käyttäjälle:\n' + event.fullName)) {
      this.accept(event.id);
    }
  }
}

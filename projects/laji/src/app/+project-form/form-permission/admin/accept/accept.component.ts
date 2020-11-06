import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../../../../shared/service/form-permission.service';
import { UserService } from '../../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { AbstractPermission } from '../abstract-permission';
import { ProjectFormService } from '../../../project-form.service';

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
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService
  ) { super(); }

  ngOnInit() {
    this.subParam = this.projectFormService.getFormFromRoute$(this.route).subscribe(form => {
      this.collectionId = form.collectionID;
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

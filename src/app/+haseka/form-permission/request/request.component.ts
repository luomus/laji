import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../form-permission.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { UserService } from '../../../shared/service/user.service';
import { FormPermission } from '../../../shared/model/FormPermission';
import { Logger } from '../../../shared/logger/logger.service';
import { Person } from '../../../shared/model/Person';
import { LocalizeRouterService } from '../../../locale/localize-router.service';

@Component({
  selector: 'laji-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit, OnDestroy {

  collectionId: string;
  isAlreadyRequested = false;
  isAlreadyAllowed = false;

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
    this.subParam = this.route.params.subscribe(params => {
      this.collectionId = params['collectionId'];
      this.initFormPermission();
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  initFormPermission() {
    this.formPermissionService
      .getFormPermission(this.collectionId, this.userService.getToken())
      .subscribe(formPermission => this.checkAccess(formPermission));
  }

  makeAccessRequest() {
    this.formPermissionService.makeAccessRequest(this.collectionId, this.userService.getToken())
      .subscribe(
        (formPermission: FormPermission) => this.toastsService.showSuccess('Pyyntösi on lähetetty eteenpäin'),
        (err) => {
          if (err.status !== 406) {
            this.toastsService.showError('Pyyntöäsi lähetys epäonnistui');
            this.logger.error('Failed to send formPermission request', {
              collectionId: this.collectionId
            });
          }
        }
      );
    this.back();
  }

  back() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
  }

  private checkAccess(formPermisison: FormPermission) {
    this.userService
      .getUser()
      .subscribe((person: Person) => {
        this.isAlreadyAllowed = formPermisison.editors.indexOf(person.id) > -1 || formPermisison.admins.indexOf(person.id) > -1;
        this.isAlreadyRequested = formPermisison.permissionRequests.indexOf(person.id) > -1;
      });
  }

}

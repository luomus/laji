
import {combineLatest} from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../form-permission.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { UserService } from '../../../shared/service/user.service';
import { FormPermission } from '../../../shared/model/FormPermission';
import { Logger } from '../../../shared/logger/logger.service';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { RoutingStateService } from '../../../shared/service/routing-state.service';

@Component({
  selector: 'laji-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  formPermission: FormPermission;
  isAllowed = false;
  collectionId: string;
  backPath: string;
  backQuery: any;

  private subParam: Subscription;
  private subFPChanges: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formPermissionService: FormPermissionService,
    private localizeRouterService: LocalizeRouterService,
    private toastsService: ToastsService,
    private userService: UserService,
    private logger: Logger,
    private routingStateService: RoutingStateService
  ) { }

  ngOnInit() {
    const [path, query] = this.routingStateService.getPathAndQueryFromUrl(this.routingStateService.getPreviousUrl());
    this.backPath = path;
    this.backQuery = query;
    this.subParam = this.route.params.subscribe(params => {
      this.collectionId = params['collectionId'];
      this.initFormPermission();
    });
    this.subFPChanges = this.formPermissionService.changes$
      .subscribe(fp => this.formPermission = fp);
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
    this.subFPChanges.unsubscribe();
  }

  private initFormPermission() {
    if (!this.collectionId) {
      return;
    }
    this.formPermissionService
      .getFormPermission(this.collectionId, this.userService.getToken()).pipe(
      combineLatest(
        this.userService.getUser(),
        (permission, person) => ({permission, person})
      ))
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

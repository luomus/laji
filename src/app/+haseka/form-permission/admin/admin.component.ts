import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormPermissionService } from '../form-permission.service';
import { UserService } from '../../../shared/service/user.service';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { HistoryService } from '../../../shared/service/history.service';
import { BrowserService } from '../../../shared/service/browser.service';
import { AbstractPermission } from './abstract-permission';

@Component({
  selector: 'laji-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent extends AbstractPermission implements OnInit, OnDestroy {

  backPath: string;
  backQuery: any;

  private subParam: Subscription;
  private subFPChanges: Subscription;

  constructor(
    protected router: Router,
    protected formPermissionService: FormPermissionService,
    protected localizeRouterService: LocalizeRouterService,
    protected userService: UserService,
    private route: ActivatedRoute,
    private browserService: BrowserService,
    private historyService: HistoryService
  ) {
    super();
  }

  ngOnInit() {
    const [path, query] = this.browserService.getPathAndQueryFromUrl(this.historyService.getPrevious());
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
}

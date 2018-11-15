/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Global } from '../../../environments/global';
import { UserService } from '../../shared/service/user.service';
import { MonitoringThemeBaseComponent } from '../common/monitoring-theme-base.component';

@Component({
  selector: '[laji-wbc]',
  templateUrl: './wbc.component.html',
  styleUrls: ['./wbc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WbcComponent
       extends MonitoringThemeBaseComponent
       implements OnInit, OnDestroy {

  showNav = true;
  routeSub: Subscription;
  showStatsLinks = false;
  rights: Observable<Rights>;
  collectionID = Global.collections.wbc;
  formID = environment.wbcForm;


  constructor(
    public router: Router,
    public userService: UserService,
    protected formService: FormService,
    protected formPermissionService: FormPermissionService,
    protected translateService: TranslateService
  ) {
    super(formService, formPermissionService, translateService);
  }

  ngOnInit() {
    this.showNav = this.router.url.indexOf('form') === -1;
    this.showStatsLinks = this.router.url.indexOf('stats') !== -1;
    this.routeSub = this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNav = event.url.indexOf('form') === -1;
          this.showStatsLinks = event.url.indexOf('stats') !== -1;
        }
      });
    this.rights = this.getRights(environment.wbcForm);
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}

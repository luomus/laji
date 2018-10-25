/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Global } from '../../../environments/global';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: '[laji-wbc]',
  templateUrl: './wbc.component.html',
  styleUrls: ['./wbc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WbcComponent implements OnInit, OnDestroy {

  showForm =  false;
  showNav = true;
  routeSub: Subscription;
  showStatsLinks = false;
  rights: Observable<Rights>;
  collectionID = Global.collections.wbc;
  formID = environment.wbcForm;


  constructor(
    public router: Router,
    public userService: UserService,
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.showForm = !environment.production;
    this.showNav = this.router.url.indexOf('form') === -1;
    this.showStatsLinks = this.router.url.indexOf('stats') !== -1;
    this.routeSub = this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNav = event.url.indexOf('form') === -1;
          this.showStatsLinks = event.url.indexOf('stats') !== -1;
        }
      });
    this.rights = this.formService.getForm(environment.wbcForm, this.translateService.currentLang)
      .switchMap(form => this.formPermissionService.getRights(form))
      .catch(() => ObservableOf({edit: false, admin: false}))
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}

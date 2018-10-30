/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Global } from '../../../environments/global';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: '[laji-line-transect]',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnInit, OnDestroy {

  forms = [environment.lineTransectForm, environment.lineTransectEiVakioForm, environment.lineTransectKartoitusForm];
  showForm = true;
  showNav = true;
  routeSub: Subscription;
  rights: Observable<Rights>;
  collectionID = Global.collections.lineTransect;

  constructor(
    public router: Router,
    public userService: UserService,
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.showNav = this.shouldShowNav(this.router.url);
    this.routeSub = this.router
      .events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNav = this.shouldShowNav(event.url);
        }
      });
    this.rights = this.formService.getForm(environment.lineTransectForm, this.translateService.currentLang)
      .switchMap(form => this.formPermissionService.getRights(form))
      .catch(() => ObservableOf({edit: false, admin: false}))
  }

  shouldShowNav(url) {
     return ['form', 'ei-vakio', 'kartoitus'].every(path => url.indexOf(path) === -1);
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}

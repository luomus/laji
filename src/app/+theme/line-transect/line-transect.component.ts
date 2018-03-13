import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs/Observable';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[laji-line-transect]',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnInit, OnDestroy {

  showForm = false;
  showNav = true;
  routeSub: Subscription;
  rights: Observable<Rights>;


  constructor(
    public router: Router,
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
    this.showForm = !environment.production;
    this.showNav = this.router.url.indexOf('form') === -1;
    this.routeSub = this.router
      .events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNav = event.url.indexOf('form') === -1;
        }
      });
    this.rights = this.formService.getForm(environment.lineTransectForm, this.translateService.currentLang)
      .switchMap(form => this.formPermissionService.getRights(form))
      .catch(() => Observable.of({edit: false, admin: false}))
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}

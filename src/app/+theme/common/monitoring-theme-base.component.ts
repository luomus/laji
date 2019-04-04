
import { filter, map, startWith, switchMap } from 'rxjs/operators';
/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../shared/service/form.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavLink, ThemeFormService } from './theme-form.service';

interface NavData {
  title: string;
  navLinks: NavLink[];
  formID: string;
}

@Component({
  template: `
    <laji-theme-page *ngIf="navData$ | async as data"
                     [title]="data.title"
                     [formID]="data.formID"
                     [showNav]="showNav$ | async"
                     [navLinks]="data.navLinks">
      <router-outlet></router-outlet>
    </laji-theme-page>
  `,
  styles: [`
    :host {
        display: flex;
        flex: 1 0 auto;
        width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringThemeBaseComponent implements OnInit {

  navData$: Observable<NavData>;
  showNav$: Observable<boolean>;

  constructor(
    protected formService: FormService,
    protected formPermissionService: FormPermissionService,
    protected translateService: TranslateService,
    private themeFormService: ThemeFormService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    const urls$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects || e.url),
      startWith(this.router.url)
    );
    this.showNav$ = urls$.pipe(
      switchMap((url) => this.route.data.pipe(
        map(({hideNavFor = []}) => hideNavFor.every(u => !url.match(u)))
      ))
    );
    const markActive = (navLink, url): NavLink => ({
      ...navLink,
      active: (navLink.routerLink[0] === 'form' && url.match('places'))
        ? true
        : !!url.match(navLink.routerLink.join('/')),
      children: navLink.children ? navLink.children.map(child => markActive(child, url)) : undefined
    });

    // 'activeMatch' prop is greedier than routerLink matching.
    const markActives = (navLinks: NavLink[], url: string): NavLink[] => {
      let foundGreedy = false;
      const _navLinks = [];
      for (const navLink of navLinks) {
        if (!foundGreedy && navLink.activeMatch && url.match(navLink.activeMatch)) {
          _navLinks.push({...navLink, active: true});
          foundGreedy = true;
        } else {
          _navLinks.push(navLink);
        }
      }
      if (!foundGreedy) {
        return navLinks.map(nl => markActive(nl, url));
      }
      return _navLinks;
    };
    this.navData$ = this.route.data.pipe(
      switchMap(({title, formID}: {title: string, formID: string}) => this.themeFormService.getNavLinks$(this.route).pipe(
        switchMap(navLinks => urls$.pipe(
          map(url => ({
            title,
            navLinks: markActives(navLinks, url),
            formID
          }))
        ))
      )
    ));
  }

  protected getRights(formId): Observable<Rights> {
    return this.formService.getForm(formId, this.translateService.currentLang).pipe(
      switchMap(form => this.formPermissionService.getRights(form))
    );
  }
}

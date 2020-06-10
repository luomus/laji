import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../shared/service/form.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavLink, ThemeFormService } from './theme-form.service';
import { Form } from '../../shared/model/Form';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';

export interface Breadcrumb {
  link: string;
  label: string;
}

interface ViewModel {
  form: Form.SchemaForm;
  data: NavData;
}

interface NavData {
  title: string;
  navLinks: NavLink[];
  titleFromCollectionName: boolean;
  breadcrumbs?: Breadcrumb[];
}

@Component({
  template: `
    <laji-theme-page *ngIf="vm$ | async as vm"
                     [title]="vm.data.titleFromCollectionName ? (vm.form.collectionID | label) : vm.data.title"
                     [secondary]="vm.form | formHasFeature:formFeatures.SecondaryCopy"
                     [formID]="vm.form.id"
                     [showNav]="showNav$ | async"
                     [navLinks]="vm.data.navLinks">
      <laji-theme-breadcrumb
        *ngIf="vm.data.breadcrumbs"
        [breadcrumb]="vm.data.breadcrumbs"
        [navLinks]=vm.data.navLinks
      ></laji-theme-breadcrumb>
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

  vm$: Observable<ViewModel>;
  showNav$: Observable<boolean>;
  formFeatures = Form.Feature;

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

    this.vm$ = hotObjectObserver<ViewModel>({
      data: this.getRouteDate(urls$),
      form: this.themeFormService.getForm(this.route.snapshot)
    });
  }

  private getRouteDate(urls$: Observable<string>) {
    const markActiveByRouterLink = (navLink, url): NavLink => ({
      ...navLink,
      active: (navLink.routerLink[0] === 'form' && url.match('places'))
        ? true
        : !!url.match(navLink.routerLink.join('/')),
      children: navLink.children ? navLink.children.map(child => markActiveByRouterLink(child, url)) : undefined
    });

    // navLink.activeMatch prop is greedier than navLink.routerLink matching.
    const markActive = (navLinks: NavLink[], url: string): NavLink[] => {
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
        return navLinks.map(nl => markActiveByRouterLink(nl, url));
      }
      return _navLinks;
    };

    return this.route.data.pipe(
      switchMap((data) =>
        this.themeFormService.getNavLinks$(this.route).pipe(
          switchMap(navLinks => urls$.pipe(
            map(url => ({
              ...data,
              navLinks: markActive(navLinks, url),
            }))
          ))
        )
      ));
  }
}

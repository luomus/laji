import { Inject, Injectable, OnDestroy, Renderer2, RendererFactory2, ViewEncapsulation } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { DOCUMENT, Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';
import { PlatformService } from './platform.service';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { RouteDataService } from './route-data.service';

const MAIN_TITLE = environment.type === Global.type.iucn ? 'iucn.page.title' : 'home.main-page.title';
const MAIN_DESCRIPTION = 'footer.intro1';

const ALL_META_KEYS = [
  'description'
];

@Injectable({
  providedIn: 'root'
})
export class HeaderService implements OnDestroy {

  private routeSub: Subscription;
  private currentRoute: string;
  private renderer: Renderer2;

  constructor(
    @Inject(DOCUMENT) private document,
    private router: Router,
    private location: Location,
    private platformService: PlatformService,
    private title: Title,
    private translateService: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private metaService: Meta,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(this.document, {
      id: '-1',
      encapsulation: ViewEncapsulation.None,
      styles: [],
      data: {}
    });
  }

  public startRouteListener(): void {
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.location.path() || '/'),
      filter(newRoute => this.currentRoute !== newRoute)
    ).subscribe((newRoute) => {
      this.currentRoute = newRoute;

      // Set page title
      this.getDeepestTitle(this.router.routerState.snapshot.root).pipe(
        map(titles => [...titles, MAIN_TITLE]),
        map(titles => Array.from(new Set<string>(titles))),
        switchMap(titles => this.translateService.get(titles))
      ).subscribe(pageTitle => {
        this.title.setTitle(Object.keys(pageTitle).map(key => decodeURI(pageTitle[key])).join(' | '));
      });

      // Set page meta tags
      RouteDataService.getDeepest<object>(this.router.routerState.snapshot.root).pipe(
        map(meta => ({description: MAIN_DESCRIPTION, ...meta}))
      ).subscribe(meta => {
        ALL_META_KEYS.map((key) => {
          const propertySelector = `property='${key}'`;
          if (meta?.[key]) {
            this.metaService.updateTag({property: key, content: this.translateService.instant(meta[key])}, propertySelector);
          } else {
            this.metaService.removeTag(propertySelector);
          }
        });
      });

      // Set canonical link
      RouteDataService.getDeepest<string>(this.router.routerState.snapshot.root, 'canonical', '').subscribe(canonical => {
        this.updateCanonicalUrl(canonical ? this.localizeRouterService.translateRoute(canonical, this.translateService.currentLang) : newRoute);
      });

      this.updateAlternativeLinks(newRoute);
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }

  private updateCanonicalUrl(path: string) {
    this.removeElements('link[rel="canonical"]');
    this.addLink({
      href: environment.base + path,
      rel: 'canonical'
    });
  }

  private updateAlternativeLinks(path: string) {
    this.removeElements('link[rel="alternative"]');
    this.localizeRouterService.locales.forEach(lang => {
      this.addLink({
        href: environment.base + this.localizeRouterService.translateRoute(path, lang),
        hreflang: lang,
        rel: 'alternative'
      });
    });
  }

  private removeElements(selector: string) {
    if (this.platformService.isBrowser) {
      const alternatives = this.document.querySelectorAll(selector);
      if (alternatives.length) {
        alternatives.forEach(elem => this.renderer.removeChild(this.document.head, elem));
      }
    }
  }

  private addLink(options: {[key: string]: string}): void {
    const linkElt = this.renderer.createElement('link');
    Object.keys(options).forEach(key => {
      this.renderer.setAttribute(linkElt, key, options[key]);
    });
    this.renderer.appendChild(this.document.head, linkElt);
  }

  private getDeepestTitle(routeSnapshot: ActivatedRouteSnapshot): Observable<string[]> {
    const title = [];
    if (routeSnapshot.data && routeSnapshot.data['title']) {
      title.push(routeSnapshot.data['title'] || '');
    }
    if (routeSnapshot.firstChild) {
      return this.getDeepestTitle(routeSnapshot.firstChild).pipe(
        map(label => [...label, ...title])
      );
    }
    return ObservableOf(title);
  }
}

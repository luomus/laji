import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import { CollectionApi } from './shared/api/CollectionApi';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { InformationApi } from './shared/api/InformationApi';
import { WindowRef } from './shared/windows-ref';
import { environment } from '../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { LocalizeRouterService } from './locale/localize-router.service';

declare const ga: Function;

const MAIN_TITLE = 'home.main-page.title';
const MAIN_DESCRIPTION = 'footer.intro1';

const ALL_META_KEYS = [
  'description'
];

@Component({
  selector: 'laji-app',
  providers: [
    CollectionApi,
    InformationApi
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public viewContainerRef: ViewContainerRef;
  public hasAnalytics = true;
  public isEmbedded: boolean;
  private currentRoute: string;

  constructor(
    router: Router,
    location: Location,
    toastr: ToastsManager,
    viewContainerRef: ViewContainerRef,
    windowRef: WindowRef,
    title: Title,
    translateService: TranslateService,
    localizeRouterService: LocalizeRouterService,
    metaService: Meta
  ) {
    this.viewContainerRef = viewContainerRef;
    this.hasAnalytics = !environment.disableAnalytics;
    this.isEmbedded = environment.isEmbedded || false;
    toastr.setRootViewContainerRef(viewContainerRef);

    translateService.use(localizeRouterService.getLocationLang());

    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const newRoute = location.path() || '/';
        if (this.currentRoute !== newRoute) {
          // Check if on page that should be scrolled to top
          if (!newRoute.match(/^\/(en\/|sv\/)?(taxon\/informal|observation|theme\/nafi)\//)) {
            windowRef.nativeWindow.scroll(0, 0); // remove when container scrolling is supported by the form
            const content = windowRef.nativeWindow.document.getElementById('content');
            if (content) {
              // content.scrollTop = 0;
            }
          }

          // Set page title
          this.getDeepestTitle(router.routerState.snapshot.root)
            .map(titles => [...titles, MAIN_TITLE])
            .map(titles => Array.from(new Set<string>(titles)))
            .switchMap(titles => translateService.get(titles))
            .subscribe(pageTitle => {
              title.setTitle(Object.keys(pageTitle).map(key => pageTitle[key]).join(' | '));
            });

          // Set page meta tags
          this.getDeepestMeta(router.routerState.snapshot.root)
            .map(meta => ({description: MAIN_DESCRIPTION, ...meta}))
            .switchMap(
              meta => translateService.get(Object.keys(meta).map(key => meta[key])),
              (meta, translations) => ({meta, translations})
            )
            .subscribe(data => {
              ALL_META_KEYS.map((key) => {
                const propertySelector = `property='${key}'`;
                if (data.meta && data.meta[key] && data.translations && data.translations[data.meta[key]]) {
                  metaService.updateTag({property: key, content: data.translations[data.meta[key]]}, propertySelector);
                } else {
                  metaService.removeTag(propertySelector);
                }
              });
            });

          // Use analytics
          if (this.hasAnalytics && newRoute.indexOf('/user') !== 0) {
            try {
              ga('send', 'pageview', newRoute);
            } catch (e) {}
          }

          this.currentRoute = newRoute;
        }
        const tree = router.parseUrl(router.url);

        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) { element.scrollIntoView(true); }
        }
      }
    });
  }

  private getDeepestMeta(routeSnapshot: ActivatedRouteSnapshot): Observable<object> {
    const meta = routeSnapshot.data && routeSnapshot.data['meta'] ? routeSnapshot.data['meta'] : {};
    if (routeSnapshot.firstChild) {
      return this.getDeepestMeta(routeSnapshot.firstChild)
        .map(childMeta => ({...meta, ...childMeta}));
    }
    return Observable.of(meta);
  }

  private getDeepestTitle(routeSnapshot: ActivatedRouteSnapshot): Observable<string[]> {
    const title = [];
    if (routeSnapshot.data && routeSnapshot.data['title']) {
      title.push(routeSnapshot.data['title'] || '');
    }
    if (routeSnapshot.firstChild) {
      return this.getDeepestTitle(routeSnapshot.firstChild)
        .map(label => [...label, ...title]);
    }
    return Observable.of(title);
  }
}

import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, PLATFORM_ID, ViewContainerRef } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser, Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { HistoryService } from '../../shared/service/history.service';
import { Global } from '../../../environments/global';


declare const ga: Function;

const MAIN_TITLE = environment.type === Global.type.iucn ? 'iucn.page.title' : 'home.main-page.title';
const MAIN_DESCRIPTION = 'footer.intro1';

const ALL_META_KEYS = [
  'description'
];

@Component({
  selector: 'laji-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public viewContainerRef: ViewContainerRef;
  public hasAnalytics = true;
  public isEmbedded: boolean;
  public onFrontPage = false;
  public displayFeedback = true;
  private currentRoute: string;

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object,
    router: Router,
    location: Location,
    viewContainerRef: ViewContainerRef,
    title: Title,
    translateService: TranslateService,
    localizeRouterService: LocalizeRouterService,
    metaService: Meta,
    historyService: HistoryService // Need to include this here so that history recording starts
  ) {
    this.viewContainerRef = viewContainerRef;
    this.hasAnalytics = !environment.disableAnalytics;
    this.isEmbedded = environment.type === Global.type.embedded;

    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const newRoute = location.path() || '/';
      if (this.currentRoute !== newRoute) {

        // Check if should scroll to top
        if (event.id !== 1 && isPlatformBrowser(this.platformID) ) {
          this.getDeepest<boolean>(router.routerState.snapshot.root, 'noScrollToTop', false)
            .subscribe(skip => {
              if (!skip) {
                this.window.scroll(0, 0); // remove when container scrolling is supported by the form
                /*
                const content = this.window.document.getElementById('content');
                if (content) {
                  content.scrollTop = 0;
                }
                */
              }
            });
        }

        // Set page title
        this.getDeepestTitle(router.routerState.snapshot.root).pipe(
          map(titles => [...titles, MAIN_TITLE]),
          map(titles => Array.from(new Set<string>(titles))),
          switchMap(titles => translateService.get(titles))
        ).subscribe(pageTitle => {
            title.setTitle(Object.keys(pageTitle).map(key => pageTitle[key]).join(' | '));
          });

        // Set page meta tags
        this.getDeepest<object>(router.routerState.snapshot.root).pipe(
          map(meta => ({description: MAIN_DESCRIPTION, ...meta})),
          switchMap(meta => translateService.get(Object.keys(meta).map(key => meta[key])).pipe(
            map(translations => ({meta, translations}))
          )))
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

        // Hide feedback when data has displayFeedback: false
        this.getDeepest<boolean>(router.routerState.snapshot.root, 'displayFeedback', true).subscribe(
          (hide) => this.displayFeedback = hide
        );

        this.currentRoute = newRoute;

        this.onFrontPage = router.isActive('/', true)
          || router.isActive('/en', true)
          || router.isActive('/sv', true);
      }

      // Use analytics
      if (this.hasAnalytics && newRoute.indexOf('/user') !== 0) {
        try {
          ga('send', 'pageview', newRoute);
        } catch (e) {}
      }
      const tree = router.parseUrl(router.url);

      if (tree.fragment) {
        try {
          const element = document.querySelector('#' + tree.fragment);
          if (element) { element.scrollIntoView(true); }
        } catch (e) { }
      }
    });
  }

  private getDeepest<T>(routeSnapshot: ActivatedRouteSnapshot, key = 'meta', empty: any = {}): Observable<T> {
    const value = routeSnapshot.data && typeof routeSnapshot.data[key] !== 'undefined' ? routeSnapshot.data[key] : empty;
    if (routeSnapshot.firstChild) {
      return this.getDeepest(routeSnapshot.firstChild, key, value);
    }
    return ObservableOf(value);
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

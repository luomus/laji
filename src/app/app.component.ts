import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import { CollectionApi } from './shared/api/CollectionApi';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { InformationApi } from './shared/api/InformationApi';
import { WindowRef } from './shared/windows-ref';
import { AppConfig } from './app.config';
import { environment } from '../environments/environment';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import tileLayer = L.tileLayer;

declare const ga: Function;

const MAIN_TITLE = 'home.main-page.title';

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
    appConfig: AppConfig,
    title: Title,
    translateService: TranslateService
  ) {
    this.viewContainerRef = viewContainerRef;
    this.hasAnalytics = !appConfig.isAnalyticsDisabled();
    this.isEmbedded = environment.isEmbedded || false;
    toastr.setRootViewContainerRef(viewContainerRef);
    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const newRoute = location.path() || '/';
        if (this.currentRoute !== newRoute) {
          if (newRoute.indexOf('/observation') !== 0 && newRoute.indexOf('/theme') !== 0) {
            windowRef.nativeWindow.scroll(0, 0);
          }
          this.getDeepestTitle(router.routerState.snapshot.root)
            .map(titles => [...titles, MAIN_TITLE])
            .map(titles => Array.from(new Set<string>(titles)))
            .switchMap(titles => translateService.get(titles))
            .subscribe(pageTitle => {
              title.setTitle(Object.keys(pageTitle).map(key => pageTitle[key]).join(' | '));
            });
          if (this.hasAnalytics && newRoute.indexOf('/user') !== 0) {
            try {
              ga('send', 'pageview', newRoute);
            } catch (e) {}
          }
          this.currentRoute = newRoute;
        }
      }
    });
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

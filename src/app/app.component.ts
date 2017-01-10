import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr';
import { TaxonomyApi } from './shared/api/TaxonomyApi';
import { CollectionApi } from './shared/api/CollectionApi';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { InformationApi } from './shared/api/InformationApi';
import { WindowRef } from './shared/windows-ref';
import { AppConfig } from './app.config';

declare const ga: Function;

@Component({
  selector: 'laji-app',
  providers: [
    TaxonomyApi,
    CollectionApi,
    InformationApi
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public viewContainerRef: ViewContainerRef;
  public hasAnalytics = true;
  private currentRoute: string;

  constructor(
    router: Router,
    location: Location,
    toastr: ToastsManager,
    viewContainerRef: ViewContainerRef,
    windowRef: WindowRef,
    appConfig: AppConfig
  ) {
    this.viewContainerRef = viewContainerRef;
    this.hasAnalytics = !appConfig.isAnalyticsDisabled();
    toastr.setRootViewContainerRef(viewContainerRef);
    router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        let newRoute = location.path() || '/';
        if (this.currentRoute !== newRoute) {
          if (newRoute.indexOf('/observation') !== 0) {
            windowRef.nativeWindow.scroll(0, 0);
          }
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
}

import { Component, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';
import { Global } from '../../../environments/global';
import { setTheme } from 'ngx-bootstrap/utils';
import { RouteDataService } from '../../shared/service/route-data.service';
import { HeaderService } from '../../shared/service/header.service';
import { PlatformService } from '../../shared/service/platform.service';
import { HistoryService } from '../../shared/service/history.service';

declare const ga: Function;

@Component({
  selector: 'laji-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public viewContainerRef: ViewContainerRef;
  public hasAnalytics = true;
  public isEmbedded: boolean;
  public onFrontPage = false;
  public displayFeedback = true;
  private currentRoute: string;

  constructor(
    platformService: PlatformService,
    router: Router,
    location: Location,
    viewContainerRef: ViewContainerRef,
    headerService: HeaderService,
    historyService: HistoryService
  ) {
    setTheme('bs3');
    this.viewContainerRef = viewContainerRef;
    this.hasAnalytics = !environment.disableAnalytics;
    this.isEmbedded = environment.type === Global.type.embedded;
    headerService.startRouteListener();
    historyService.startRouteListener();

    router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const newRoute = location.path() || '/';
      if (this.currentRoute !== newRoute) {
        // Check if should scroll to top
        if (event.id !== 1 && platformService.isBrowser) {
          RouteDataService.getDeepest<boolean>(router.routerState.snapshot.root, 'noScrollToTop', false).subscribe(skip => {
              if (!skip) {
                window.scroll(0, 0);
              }
            });
        }

        // Hide feedback when data has displayFeedback: false
        RouteDataService.getDeepest<boolean>(router.routerState.snapshot.root, 'displayFeedback', true).subscribe(
          (displayFeedback) => this.displayFeedback = displayFeedback
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
}

import { Component, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { filter, startWith } from 'rxjs/operators';
import { Global } from '../../../environments/global';
import { RouteDataService } from '../../shared/service/route-data.service';
import { HeaderService } from '../../shared/service/header.service';
import { PlatformService } from '../../root/platform.service';
import { HistoryService } from '../../shared/service/history.service';
import { Util } from '../../shared/service/util.service';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { TranslateService } from '@ngx-translate/core';

declare const ga: (eventName: string, hitType: string, data: string) => void;

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
  private currentRoute?: string;

  constructor(
    platformService: PlatformService,
    router: Router,
    location: Location,
    viewContainerRef: ViewContainerRef,
    headerService: HeaderService,
    historyService: HistoryService,
    private translate: TranslateService,
    private api: LajiApiClientBService,
  ) {
    this.viewContainerRef = viewContainerRef;
    this.hasAnalytics = !environment.disableAnalytics;
    this.isEmbedded = environment.type === Global.type.embedded;
    headerService.initialize();
    historyService.startRouteListener();
    this.syncLajiApiClientBLang();

    router.events.pipe(
      filter(Util.eventIsNavigationEnd)
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


        this.currentRoute = newRoute;
        this.onFrontPage = router.isActive('/', true)
          || router.isActive('/en', true)
          || router.isActive('/sv', true);
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

  private syncLajiApiClientBLang() {
    this.translate.onLangChange
      .pipe(startWith({ lang: this.translate.currentLang }))
      .subscribe(({ lang }) => {
        this.api.setLang(lang);
      });
  }
}

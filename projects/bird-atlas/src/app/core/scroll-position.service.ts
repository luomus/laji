import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, Renderer2 } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Injectable()
export class ScrollPositionService {
  private urlBeforeNavigation: string;
  private urlToScrollPosition: {[url: string]: number} = {};

  constructor(router: Router, @Inject(PLATFORM_ID) platformId) {
    if (!isPlatformBrowser(platformId)) { return; }
    this.urlBeforeNavigation = router.url;
    router.events.pipe(
    ).subscribe(e => {
      if (e instanceof NavigationStart) {
        this.urlToScrollPosition[this.urlBeforeNavigation] = this.getCurrentBodyScroll();
      } else if (e instanceof NavigationEnd) {
        this.recallScrollPosition(e.url);
        this.urlBeforeNavigation = e.url;
      }
    });
  }

  private recallScrollPosition(url: string) {
    if (!(url in this.urlToScrollPosition)) { return; }
    const rootEl = document.querySelector('html');
    rootEl.scrollTop = this.urlToScrollPosition[url];
  }

  private getCurrentBodyScroll(): number {
    const rootEl = document.querySelector('html');
    return rootEl.scrollTop;
  }
}

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Injectable()
export class ScrollPositionService {
  private urlBeforeNavigation: string;
  private urlToScrollPosition: {[url: string]: number} = {};

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId) {
    if (!isPlatformBrowser(platformId)) { return; }

    // Disable browser's default scroll restoration
    // (not sure if necessary, Angular is probably already doing this behind the scenes)
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    this.urlBeforeNavigation = router.url;

    router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        // save the scroll position for the page we are leaving
        this.urlToScrollPosition[this.urlBeforeNavigation] = window.scrollY;
      } else if (e instanceof NavigationEnd) {
        // scroll to top on the new page
        window.scrollTo({
          top: 0,
          behavior: 'auto'
        });
        // update the current url
        this.urlBeforeNavigation = e.url;
      }
    });
  }

  public recallScrollPosition() {
    /*
      Delaying execution until the next event cycle allows for this function to be
      called before the DOM is updated. Eg. in a tap pipe in an observable that is
      subscribed to in a template by an async pipe. This way the scroll position is
      updated after some dynamic content has finished loading.
     */
    setTimeout(() => {
      this._recallScrollPosition(this.router.url);
    });
  }

  private _recallScrollPosition(url: string) {
    if (!isPlatformBrowser(this.platformId)) { return; }
    if (url in this.urlToScrollPosition) {
      window.scrollTo({
        top: this.urlToScrollPosition[url],
        behavior: 'smooth'
      });
    }
  }
}

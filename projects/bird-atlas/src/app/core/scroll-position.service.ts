import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

interface PathData {
  scrollPosition: number;
  [additionalKeys: string | number]: any;
}

@Injectable()
export class ScrollPositionService {
  private urlBeforeNavigation: string;
  private urlToPathData: {[url: string]: PathData} = {};
  private lastNavigationWasPopstate = false;

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
        this.saveScrollPosition();
        this.lastNavigationWasPopstate = e.navigationTrigger === 'popstate';
      } else if (e instanceof NavigationEnd) {
        window.scrollTo({
          top: 0,
          behavior: 'auto'
        });
        this.recallScrollPosition();

        // update the current url
        this.urlBeforeNavigation = e.url;
      }
    });
  }

  recallScrollPosition() {
    if (!isPlatformBrowser(this.platformId) || !this.lastNavigationWasPopstate || !(this.router.url in this.urlToPathData)) { return; }
    /*
      Delaying execution until the next event cycle allows for this function to be
      called before the DOM is updated. Eg. in a tap pipe in an observable that is
      subscribed to in a template by an async pipe. This way the scroll position is
      updated after some dynamic content has finished loading.
     */
    setTimeout(() => {
      window.scrollTo({
        top: this.urlToPathData[this.router.url].scrollPosition,
        behavior: 'smooth'
      });
    });
  }

  setPathData(data: any) {
    this.urlToPathData[this.urlBeforeNavigation] = {
      ...this.urlToPathData[this.urlBeforeNavigation],
      ...data
    };
  }
  getPathData() {
    return (this.lastNavigationWasPopstate && this.urlToPathData[this.urlBeforeNavigation])
      ? this.urlToPathData[this.urlBeforeNavigation]
      : {};
  }

  private saveScrollPosition() {
    if (this.urlToPathData[this.urlBeforeNavigation]) {
      this.urlToPathData[this.urlBeforeNavigation].scrollPosition = window.scrollY;
    } else {
      this.urlToPathData[this.urlBeforeNavigation] = { scrollPosition: window.scrollY };
    }
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Util } from './util.service';

const MAX_HISTORY = 30;

@Injectable({providedIn: 'root'})
export class HistoryService implements OnDestroy {
  private history: string[] = [];
  private anyPageLoaded = false;
  private isInitialLoad = false;
  private routeSub?: Subscription;

  constructor(
    private router: Router
  ) {}

  startRouteListener() {
    if (this.routeSub) {
      return;
    }
    this.routeSub = this.router.events.pipe(
      filter(Util.eventIsNavigationEnd)
    ).subscribe(({urlAfterRedirects}: NavigationEnd) => {

      if (!this.anyPageLoaded) {
        this.anyPageLoaded = true;
        this.isInitialLoad = true;
      } else {
        this.isInitialLoad = false;
      }

      if (urlAfterRedirects.match(/\/user\/(login|logout)/)
        || this.history[this.history.length - 1] === urlAfterRedirects) {
        return;
      }

      if (this.router.getCurrentNavigation()?.extras.replaceUrl) {
        this.history.pop();
        this.history = [...this.history, urlAfterRedirects];
        return;
      }

      if (this.history[this.history.length - 2] === urlAfterRedirects) {
        this.history.pop();
      } else {
        this.history = [...this.history, urlAfterRedirects];
        if (this.history.length > MAX_HISTORY) {
          this.history.shift();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  public clear() {
    this.history = [];
  }

  public hasPrevious() {
    return this.history.length > 1;
  }

  public isFirstLoad() {
    return this.isInitialLoad;
  }
}

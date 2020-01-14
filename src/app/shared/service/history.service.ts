import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

const MAX_HISTORY = 30;

@Injectable({providedIn: 'root'})
export class HistoryService {
  private history = [];
  private hasBack = false;

  constructor(
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(({urlAfterRedirects}: NavigationEnd) => {
      if (urlAfterRedirects.match(/\/user\/(login|logout)/) || this.history[this.history.length - 1] === urlAfterRedirects) {
        return;
      }
      if (this.history[this.history.length - 2] === urlAfterRedirects) {
        this.hasBack = true;
        this.history.pop();
      } else {
        this.history = [...this.history, urlAfterRedirects];
        if (this.history.length > MAX_HISTORY) {
          this.history.shift();
        }
      }
    });
  }

  public clear() {
    this.history = [];
  }

  public hasPrevious() {
    return this.history.length > 1;
  }

  public getPrevious(): string {
    return this.history[this.history.length - 2] || '';
  }

  public isFirstLoad() {
    return !(this.hasPrevious() || this.hasBack);
  }
}

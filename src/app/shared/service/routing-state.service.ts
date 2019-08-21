import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

const MAX_HISTORY = 30;

@Injectable({providedIn: 'root'})
export class RoutingStateService {
  private history = [];

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
        this.history.pop();
      } else {
        this.history = [...this.history, urlAfterRedirects];
        if (this.history.length > MAX_HISTORY) {
          this.history.shift();
        }
      }
    });
  }

  public hasHistory() {
    return this.history.length > 1;
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public getPreviousUrl(): string {
    return this.history[this.history.length - 2] || '';
  }

  public getPathAndQueryFromUrl(uri: string): [string, any] {
    const [path, query = ''] = uri.split('?');
    const backQuery = query.split('&').filter(s => s).reduce((q, param) => {
      const [name, value] = param.split('=');
      q[name]  = value;
      return q;
    }, {});
    return [path, backQuery];
  }
}

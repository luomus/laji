import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class RoutingStateService {
  private history = [];

  constructor(
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(({urlAfterRedirects}: NavigationEnd) => {
      this.history = [...this.history, urlAfterRedirects];
    });
  }

  public getHistory(): string[] {
    return [...this.history];
  }

  public removeLast(): void {
    this.history.pop();
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

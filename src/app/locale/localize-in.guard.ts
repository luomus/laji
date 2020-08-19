import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LocalStorage } from 'ngx-webstorage';
import { LAST_LANG_KEY, LocalizeRouterService } from './localize-router.service';
import { PlatformService } from '../shared/service/platform.service';
import { GraphQLService } from '../graph-ql/service/graph-ql.service';

/**
 * Changes the locale value based on lang found in the data
 */
@Injectable({
  providedIn: 'root'
})
export class LocalizeInGuard implements CanActivate {
  @LocalStorage(LAST_LANG_KEY, 'en') protected lastLang;

  constructor(
    private router: Router,
    private platformService: PlatformService,
    private graphQLService: GraphQLService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): UrlTree | boolean {
    if (this.platformService.isBrowser) {
      this.graphQLService.flushCache();
    }
    return this.router.parseUrl(
      LocalizeRouterService.translatePath(state.url, this.lastLang)
    );
  }
}

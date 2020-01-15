import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Location } from '@angular/common';
import { LocalStorage } from 'ngx-webstorage';
import { LAST_LANG_KEY, LocalizeRouterService } from './localize-router.service';

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
    private location: Location
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): UrlTree | boolean {

    return this.router.parseUrl(
      LocalizeRouterService.translatePath(this.location.path(), this.lastLang)
    );
  }
}

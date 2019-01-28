import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * Changes the locale value based on lang found in the data
 *
 * Plz note that:
 * This needs to be a guard so that it's run before resolvers and other guards
 */
@Injectable({
  providedIn: 'root'
})
export class LocalizeGuard implements CanActivate {

  constructor(
    private translateService: TranslateService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    const lang = next.data['lang'] || 'fi';

    if (this.translateService.getDefaultLang() !== 'fi' && lang !== 'fi') {
      this.translateService.setDefaultLang('fi');
    }

    if (this.translateService.currentLang !== lang) {
      this.translateService.use(lang);
    }

    return true;
  }
}

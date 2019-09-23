import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from '../shared/service/history.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
    private translateService: TranslateService,
    private historyService: HistoryService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> {
    const lang = next.data['lang'] || 'fi';

    if (this.translateService.getDefaultLang() !== 'fi' && lang !== 'fi') {
      this.translateService.setDefaultLang('fi');
    }
    if (this.translateService.currentLang !== lang) {
      this.historyService.clear();
      return this.translateService.use(lang).pipe(
        map(() => true)
      );
    }

    return true;
  }
}

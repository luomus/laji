import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HistoryService } from '../shared/service/history.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  canActivate(next: ActivatedRouteSnapshot): boolean | Observable<boolean> {
    const defaultLang = environment.defaultLang || 'fi';
    const lang = next.data['lang'] || defaultLang;

    if (this.translateService.getDefaultLang() !== defaultLang && lang !== defaultLang) {
      this.translateService.setDefaultLang(defaultLang);
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

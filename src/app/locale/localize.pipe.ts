import { PipeTransform, Pipe, Injectable, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/observable/forkJoin';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from './localize-router.service';
import { Router } from '@angular/router';

@Injectable()
@Pipe({
  name: 'localize',
  pure: false // required to update the value when the promise is resolved
})
export class LocalizePipe implements PipeTransform {
  private value: string | any[] = '';
  private lastKey: string | any[];
  private lastLanguage: string;

  constructor(
    private localizeRouterService: LocalizeRouterService,
    private translateService: TranslateService,
    private router: Router,
    private _ref: ChangeDetectorRef
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.transform(this.lastKey);
    });
  }

  /**
   * Transform current url to localized one
   * @param query
   * @param lang
   * @returns {string | any[]}
   */
  transform(query: string | any[], lang?: string): string | any[] {
    if (!lang) {
      lang = this.translateService.currentLang;
    }
    if (!query || query.length === 0 || !lang) {
      if (Array.isArray(query)) {
        query = this.localizeRouterService.getPathWithoutLocale(this.router.url);
      } else {
        return query;
      }
    }
    if (query === this.lastKey && this.lastLanguage === lang) {
      return this.value;
    }
    this.lastKey = query;
    this.lastLanguage = lang;

    /** translate key and update values */
    this.value = this.localizeRouterService.translateRoute(query, lang);
    this.lastKey = query;
    this._ref.markForCheck();

    return this.value;
  }
}

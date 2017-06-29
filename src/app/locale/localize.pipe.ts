import { PipeTransform, Pipe, Injectable, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';
import { TranslateService } from '@ngx-translate/core';
import { LocalizeRouterService } from './localize-router.service';

@Injectable()
@Pipe({
  name: 'localize',
  pure: false // required to update the value when the promise is resolved
})
export class LocalizePipe implements PipeTransform {
  private value: string | any[] = '';
  private lastKey: string | any[];
  private lastLanguage: string;
  private subscription: Subscription;

  constructor(
    private localizeRouterService: LocalizeRouterService,
    private translateService: TranslateService,
    private _ref: ChangeDetectorRef
  ) {
    this.translateService.onLangChange.subscribe(() => {
      this.transform(this.lastKey);
    });
  }

  /**
   * Transform current url to localized one
   * @param query
   * @returns {string | any[]}
   */
  transform(query: string | any[]): string | any[] {
    if (!query || query.length === 0 || !this.translateService.currentLang) {
      return query;
    }
    if (query === this.lastKey && this.lastLanguage === this.translateService.currentLang) {
      return this.value;
    }
    this.lastKey = query;
    this.lastLanguage = this.translateService.currentLang;

    /** translate key and update values */
    this.value = this.localizeRouterService.translateRoute(query);
    this.lastKey = query;
    this._ref.markForCheck();

    return this.value;
  }
}

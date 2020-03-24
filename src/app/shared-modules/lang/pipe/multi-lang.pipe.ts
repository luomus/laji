import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { MultiLangService } from '../service/multi-lang.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'multiLang',
  pure: false
})
export class MultiLangPipe implements PipeTransform, OnDestroy {

  public static lang;
  public value = '';

  onLangChange: Subscription;

  constructor(private translate: TranslateService,
              private _ref: ChangeDetectorRef) {

  }

  transform(value: any, addError: boolean, useFallback = true, lang?: string): any {
    if (typeof value === 'string' || typeof value !== 'object') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v, addError, useFallback, lang));
    }

    this.value = this.pickLang(value, addError, useFallback, lang);
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.value = this.pickLang(value, addError, useFallback, lang);
        this._ref.markForCheck();
      });
    }
    return this.value;
  }

  ngOnDestroy() {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
      this.onLangChange = undefined;
    }
  }

  private pickLang(value, error, useFallback, lang?: string) {
    lang = lang || this.translate.currentLang;
    const hasLang = MultiLangService.hasValue(value, lang);
    if (!hasLang && !useFallback) {
      return '';
    }
    if (error && !hasLang) {
      return '<p class="error-content">' + this.translate.instant('translationsMissingNew') + '</p>' +
      MultiLangService.getValue(value, lang, '(%lang%) %value%');
    }
    return MultiLangService.getValue(value, lang, '%value% (%lang%)');
  }
}

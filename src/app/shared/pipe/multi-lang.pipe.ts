import { Pipe, PipeTransform, EventEmitter, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslateService, LangChangeEvent } from 'ng2-translate';
/**
 * Format a multi lang field to asked string
 * Takes object or string and returns it with lang code if the value wasn't active
 * Usage:
 *   value | multiLang
 */
@Pipe({
  name: 'multiLang',
  pure: false
})
export class MultiLangPipe implements PipeTransform, OnDestroy {

  public static lang;
  public value = '';
  public fallback = ['fi', 'en', 'sv'];

  onLangChange: EventEmitter<LangChangeEvent>;

  constructor(private translate: TranslateService,
              private _ref: ChangeDetectorRef) {

  }

  transform(value: any, useFallback = true): string {
    if (typeof value === 'string' || typeof value !== 'object') {
      return value;
    }
    this.value = this.pickLang(value, useFallback);
    if (!this.onLangChange) {
      this.onLangChange = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.value = this.pickLang(value, useFallback);
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

  private pickLang(value, useFallback) {
    let lang = this.translate.currentLang;
    if (value[lang] || !useFallback) {
      return value[lang] || '';
    }
    for (let i = 0; i < 3; i++) {
      if (this.fallback[i] === lang) {
        continue;
      }
      if (value[this.fallback[i]]) {
        return value[this.fallback[i]] + ' (' + this.fallback[i] + ')';
      }
    }
    return '';
  }
}

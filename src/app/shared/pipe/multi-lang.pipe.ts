import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from 'ng2-translate';
/**
 * Format a multi lang field to asked string
 * Takes object or string and returns it with lang code if the value wasn't active
 * Usage:
 *   value | multiLang
 */
@Pipe({
  name: 'multiLang'
})
export class MultiLangPipe implements PipeTransform {

  public static lang;
  public fallback = ['fi', 'en', 'sv'];

  constructor(private translate: TranslateService) {

  }

  transform(value: any, useFallback: boolean = true): string {
    if (typeof value === 'string' || typeof value !== 'object') {
      return value;
    }
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

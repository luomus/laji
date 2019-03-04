import { Injectable } from '@angular/core';

@Injectable()
export class MultiLangService {

  static readonly lang = ['en', 'fi', 'sv'];

  /**
   * Return true only if given multiLang object has the language value.
   * @returns boolean
   */
  static hasValue(multi: object, lang: string): boolean {
    return !!multi[lang];
  }

  /**
   * Returns value of multiLang object in preferred lang.
   * If no translation available then this will fallback to other lang in following order: en > fi > sv
   * If fallback element is given then it can have following string %value% and %lang%. These are replaced
   * by the given values by this function
   *
   * @returns any
   */
  static getValue(multi: object, lang: string, fallback = ''): string|any {
    if (typeof multi !== 'object' || lang === 'multi') {
      return multi;
    }
    if (multi[lang]) {
      return multi[lang];
    }
    for (let i = 0; i < MultiLangService.lang.length; i++) {
      if (MultiLangService.lang[i] === lang) {
        continue;
      }
      if (multi[MultiLangService.lang[i]]) {
        return !fallback ?
          multi[MultiLangService.lang[i]] :
          fallback.replace('%value%', multi[MultiLangService.lang[i]]).replace('%lang%', MultiLangService.lang[i]);
      }
    }
    return '';
  }

  static valueToString(multi: object): string {
    const values = [];
    for (let i = 0; i < MultiLangService.lang.length; i++) {
      const lang = MultiLangService.lang[i];

      if (MultiLangService.hasValue(multi, lang)) {
        const val = MultiLangService.getValue(multi, lang);
        if (Array.isArray(val)) {
          for (let j = 0; j < val.length; j++) {
            values.push(val[j] + ' (' + lang + ')');
          }
        } else {
          values.push(val + ' (' + lang + ')');
        }
      }
    }

    return values.join('; ');
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class MultiLangService {

  static readonly lang = ['en', 'fi', 'sv'];

  /**
   * Return true only if given multiLang object has the language value.
   * @returns boolean
   */
  static hasValue(multi: any, lang: string): boolean {
    return multi && !!multi[lang];
  }

  /**
   * Returns value of multiLang object in preferred lang.
   * If no translation available then this will fallback to other lang in following order: en > fi > sv
   * If fallback element is given then it can have following string %value% and %lang%. These are replaced
   * by the given values by this function
   *
   * @returns any
   */
  static getValue(multi: unknown, lang: string, fallback = ''): string|any {
    if (typeof multi !== 'object' || lang === 'multi' || multi === null) {
      return multi || '';
    }
    if (multi[lang]) {
      return multi[lang];
    }
    for (const _lang of MultiLangService.lang) {
      if (_lang === lang) {
        continue;
      }

      if (multi[_lang]) {
        return !fallback ?
          multi[_lang] :
          fallback.replace('%value%', multi[_lang]).replace('%lang%', _lang);
      }
    }
    return '';
  }

  static valuesToArray(multi:Record<string, unknown>): string[] {
    const values = [];

    for (const lang of MultiLangService.lang) {
      if (MultiLangService.hasValue(multi, lang)) {
        const val = MultiLangService.getValue(multi, lang);
        if (Array.isArray(val)) {
          for (const _val of val) {
            values.push(_val + ' (' + lang + ')');
          }
        } else {
          values.push(val + ' (' + lang + ')');
        }
      }
    }

    return values
  }

  static valueToString(multi: Record<string, unknown>): string {
    const values = MultiLangService.valuesToArray(multi);

    return values.join('; ');
  }
}

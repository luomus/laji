
export class MultiLangService {

  static readonly lang = ['en', 'fi', 'sv'];

  /**
   * Return true only if given multiLang object has the language value.
   * @param multi
   * @param lang
   * @returns {boolean}
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
   * @param multi
   * @param lang
   * @param fallback
   * @returns {any}
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

}

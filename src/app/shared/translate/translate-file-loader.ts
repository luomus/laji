import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';

export class TranslateFileLoader implements TranslateLoader {
  private translations = {
    'en': require('../../../i18n/en.json'),
    'fi': require('../../../i18n/fi.json'),
    'sv': require('../../../i18n/sv.json'),
  };

  getTranslation(lang: string): Observable<any> {
    if (!this.translations[lang]) {
      return Observable.of({});
    }
    return Observable.of(this.translations[lang]);
  }
}

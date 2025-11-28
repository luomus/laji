import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of as ObservableOf } from 'rxjs';

import fi from '../../../i18n/fi.json';
import sv from '../../../i18n/sv.json';
import en from '../../../i18n/en.json';

export class TranslateFileLoader implements TranslateLoader {
  private translations = { en, fi, sv };

  getTranslation(lang: 'en'|'fi'|'sv'): Observable<any> {
    if (!this.translations[lang]) {
      return ObservableOf({});
    }
    return ObservableOf(this.translations[lang]);
  }
}

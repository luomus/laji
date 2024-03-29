import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';

export class LazyTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return from(import(`../../../../i18n/${lang}.json`));
  }
}

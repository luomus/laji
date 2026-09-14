import { TranslateLoader } from '@ngx-translate/core';
import { from, map, Observable } from 'rxjs';

export class LazyTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return from(import(`../../../../i18n/${lang}.json`)).pipe(map(a => a.default));
  }
}

import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export class LazyTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    lang = 'en';
    return from(import(`../../../../../laji/src/i18n/${lang}.json`)).pipe(
      switchMap(base => from(import(`../../../../i18n/${lang}.json`)).pipe(
        map(local => ({...base, ...local}))
      ))
    );
  }
}

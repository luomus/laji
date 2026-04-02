import { TranslateLoader } from '@ngx-translate/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs';

export class LazyTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return from(import(`../../../../laji/src/i18n/${lang}.json`)).pipe(
      map(a => a.default),
      switchMap(base => from(import(`../../../i18n/${lang}.json`)).pipe(
        map(b => b.default),
        map(local => ({...base, ...local}))
      ))
    );
  }
}

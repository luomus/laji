import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';


export abstract class AbstractCachedHttpService<T> {

  protected currentLang: string;
  private _fetch;

  protected constructor(private valueKey = '', private idKey = 'id') {}

  fetchList(query: Observable<T[]>, lang: string): Observable<T[]> {
    return this.fetchLookup(query, lang).pipe(
      map(data => Object.values(data))
    );
  }

  fetchLookup(query: Observable<any[]>, lang: string): Observable<{[id: string]: T}> {
    if (lang !== this.currentLang || !this._fetch) {
      this.currentLang = lang;
      this._fetch = query.pipe(
        map(data => (data || []).reduce((cumulative, current) => {
          cumulative[current[this.idKey]] = this.valueKey ? current[this.valueKey] : current;
          return cumulative;
        }, {})),
        shareReplay(1)
      );
    }
    return this._fetch;
  }

  fetchById(query: Observable<T[]>, lang: string, id: string): Observable<T> {
    return this.fetchLookup(query, lang).pipe(
      map(tags => tags[id])
    );
  }
}

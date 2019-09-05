import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';


export abstract class AbstractCachedHttpService<T> {

  protected currentData: {[id: string]: T};
  protected currentLang: string;
  private pendingFetch;

  protected constructor(private valueKey = '', private idKey = 'id') {}

  fetchList(query: Observable<T[]>, lang: string): Observable<T[]> {
    return this.fetchLookup(query, lang).pipe(
      map(data => Object.values(data))
    );
  }

  fetchLookup(query: Observable<any[]>, lang: string): Observable<{[id: string]: T}> {
    if (lang === this.currentLang) {
      if (this.currentData) {
        return ObservableOf(this.currentData);
      } else if (this.pendingFetch) {
        return Observable.create((observer: Observer<any>) => {
          const onComplete = (res: any) => {
            observer.next(res);
            observer.complete();
          };
          this.pendingFetch.subscribe(
            () => { onComplete(this.currentData); }
          );
        });
      }
    }
    this.currentData = undefined;
    this.pendingFetch = query.pipe(
      map(data => (data || []).reduce((cumulative, current) => {
        cumulative[current[this.idKey]] = this.valueKey ? current[this.valueKey] : current;
        return cumulative;
      }, {})),
      tap((data) => this.currentData = data),
      share()
    );
    this.currentLang = lang;

    return this.pendingFetch;
  }

  fetchById(query: Observable<T[]>, lang: string, id: string): Observable<T> {
    return this.fetchLookup(query, lang).pipe(
      map(tags => tags[id])
    );
  }
}

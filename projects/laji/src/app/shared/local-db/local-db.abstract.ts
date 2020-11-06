import * as localForage from 'localforage';
import { from as ObservableFrom, Observable, of as ObservableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export abstract class LocalDb<T> {

  protected db: LocalForage;

  protected constructor(dbName = 'cache', protected isPlatformBrowser = true) {
    this.db = localForage.createInstance({
      name: dbName
    });
  }

  setItem(key: string, value: T): Observable<T> {
    if (!this.isPlatformBrowser) {
      return ObservableOf(value);
    }
    return ObservableFrom(this.db.setItem(key, value)).pipe(
      map<any, T>(v => v),
      catchError(() => ObservableOf<T>(value))
    );
  }

  getItem(key: string): Observable<T> {
    if (!this.isPlatformBrowser) {
      return ObservableOf(null);
    }
    return ObservableFrom(this.db.getItem(key)).pipe(
      catchError(() => ObservableOf(null))
    );
  }

}

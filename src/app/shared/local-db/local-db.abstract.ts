import * as localForage from 'localforage';
import { from as ObservableFrom, Observable, of as ObservableOf } from 'rxjs';
import { catchError } from 'rxjs/operators';

export abstract class LocalDb {

  private db;

  protected constructor(dbName = 'cache', private isPlatformBrowser = true) {
    this.db = localForage.createInstance({
      name: dbName
    });
  }

  setItem<T>(key: string, value: T): Observable<T> {
    if (!this.isPlatformBrowser) {
      return ObservableOf(value);
    }
    return ObservableFrom<T>(this.db.setItem(key, value)).pipe(
      catchError(() => ObservableOf(value))
    );
  }

  getItem<T>(key: string): Observable<T> {
    if (!this.isPlatformBrowser) {
      return ObservableOf(null);
    }
    return ObservableFrom<T>(this.db.getItem(key)).pipe(
      catchError(() => ObservableOf(null))
    );
  }

}

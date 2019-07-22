import * as localForage from 'localforage';
import { from as ObservableFrom, Observable, of as ObservableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * @deprecated use LocalStorageService by ngx-webstorage instead
 */
export abstract class LocalDb {

  private db: LocalForage;

  protected constructor(dbName = 'cache', private isPlatformBrowser = true) {
    this.db = localForage.createInstance({
      name: dbName
    });
  }

  /**
   * @deprecated use LocalStorageService by ngx-webstorage instead
   */
  setItem<T>(key: string, value: T): Observable<T> {
    if (!this.isPlatformBrowser) {
      return ObservableOf(value);
    }
    return ObservableFrom(this.db.setItem(key, value)).pipe(
      map<any, T>(v => v),
      catchError(() => ObservableOf<T>(value))
    );
  }

  /**
   * @deprecated use LocalStorageService by ngx-webstorage instead
   */
  getItem<T>(key: string): Observable<T> {
    if (!this.isPlatformBrowser) {
      return ObservableOf(null);
    }
    return ObservableFrom(this.db.getItem(key)).pipe(
      catchError(() => ObservableOf(null))
    );
  }

}

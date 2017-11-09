import * as localForage from 'localforage';
import { Observable } from 'rxjs/Observable';

export abstract class LocalDb {

  private db;

  constructor(dbName = 'cache') {
    this.db = localForage.createInstance({
      name: dbName
    });
  }

  setItem<T>(key: string, value: T): Observable<T> {
    return Observable.fromPromise<T>(this.db.setItem(key, value)).catch(() => Observable.of(value));
  }

  getItem<T>(key: string): Observable<T> {
    return Observable.fromPromise<T>(this.db.getItem(key)).catch(() => Observable.of(null));
  }

}

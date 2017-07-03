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
    return Observable.fromPromise(this.db.setItem(key, value));
  }

  getItem<T>(key: string): Observable<T> {
    return Observable.fromPromise(this.db.getItem(key));
  }

}

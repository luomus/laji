import * as localForage from 'localforage';
import { Observable, of as ObservableOf, from as ObservableFrom } from 'rxjs';

export abstract class LocalDb {

  private db;

  constructor(dbName = 'cache') {
    this.db = localForage.createInstance({
      name: dbName
    });
  }

  setItem<T>(key: string, value: T): Observable<T> {
    return ObservableFrom<T>(this.db.setItem(key, value)).catch(() => ObservableOf(value));
  }

  getItem<T>(key: string): Observable<T> {
    return ObservableFrom<T>(this.db.getItem(key)).catch(() => ObservableOf(null));
  }

}

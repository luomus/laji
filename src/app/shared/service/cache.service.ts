import { Injectable } from '@angular/core';
import * as localForage from 'localforage';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CacheService {

  constructor() {
    localForage.config({
      name: 'laji.fi'
    });
  }

  setItem<T>(key: string, value: T): Observable<T> {
    return Observable.fromPromise(localForage.setItem(key, value));
  }

  getItem<T>(key: string): Observable<T> {
    return Observable.fromPromise(localForage.getItem(key));
  }

}

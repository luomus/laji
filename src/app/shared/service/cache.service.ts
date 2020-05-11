import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { map, startWith, take, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class CacheService {

  constructor(
    private state: TransferState,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  /**
   * Transfer the state of observable from server to browser.
   *
   * This should will only take one, so it's not usable for streams.
   */
  getCachedObservable<T = any>($dataSource: Observable<T>, dataKey: string): Observable<T> {
    const key = makeStateKey<any>(dataKey);
    if (!isPlatformBrowser(this.platformId)) {
      return $dataSource.pipe(
        map(data => {
          this.state.set(key, data);
          return data;
        }),
        tap(data => console.log('storing', dataKey)),
        take(1)
      );
    } else if (isPlatformBrowser(this.platformId)) {
      const savedValue = this.state.get(key, null);
      console.log('fetch', savedValue === null, savedValue);
      this.state.remove(key); // Fetch the stored data only once
      return savedValue === null ?
        $dataSource :
        of(savedValue);
    }
  }
}

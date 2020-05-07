import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StateKey, TransferState } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';

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
  getCachedObservable<T = any>($dataSource: Observable<T>, dataKey: StateKey<string>): Observable<T> {
    if (!isPlatformBrowser(this.platformId)) {
      return $dataSource.pipe(
        map(data => {
          this.state.set(dataKey, data);
          return data;
        }),
        take(1)
      );
    } else if (isPlatformBrowser(this.platformId)) {
      const savedValue = this.state.get(dataKey, null);
      this.state.remove(dataKey); // Fetch the stored data only once
      return savedValue === null ?
        $dataSource :
        $dataSource.pipe(
          startWith(savedValue),
          take(1)
        );
    }
  }
}

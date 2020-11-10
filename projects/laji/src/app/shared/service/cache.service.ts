import { ApplicationRef, Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { catchError, filter, map, take, timeout } from 'rxjs/operators';
import { PlatformService } from './platform.service';

@Injectable({providedIn: 'root'})
export class CacheService {

  private stable = false;

  constructor(
    private state: TransferState,
    private appRef: ApplicationRef,
    private platformService: PlatformService
  ) {
    this.getStableObservable().subscribe(() => {
      this.stable = true;
    });
  }

  /**
   * Transfer the state of observable from server to browser.
   *
   * This should will only take one, so it's not usable for streams.
   */
  getCachedObservable<T = any>($dataSource: Observable<T>, dataKey: string): Observable<T> {
    const key = makeStateKey<any>(dataKey);
    if (this.platformService.isBrowser) {
      return $dataSource.pipe(
        map(data => {
          this.state.set(key, data);
          return data;
        }),
        take(1)
      );
    } else if (this.stable) {
      return $dataSource;
    }
    const savedValue = this.state.get(key, null);
    return savedValue === null ?
      $dataSource :
      of(savedValue);
  }

  private getStableObservable() {
    const stable$ = this.appRef.isStable.pipe(
      filter((isStable: boolean) => isStable),
      take(1)
    );
    if (this.platformService.isBrowser) {
      return stable$.pipe(
        timeout(5000),
        catchError(() => of(null))
      );
    }
    return stable$;
  }
}

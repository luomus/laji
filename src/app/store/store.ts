import { Observable, BehaviorSubject } from 'rxjs';
import { Inject, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { NewsState } from '../+news/news.store';

export abstract class Store<T> {
  private _state$: BehaviorSubject<T>;
  private _stateKey: any;

  protected constructor (
    name: string,
    initialState: T,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._stateKey = makeStateKey(name);
    this._state$ = new BehaviorSubject(this.transferState.get(this._stateKey, initialState));
  }

  get state$ (): Observable<T> {
    return this._state$.asObservable();
  }

  get state (): T {
    return this._state$.getValue();
  }

  setState (nextState: T): void {
    this._state$.next(nextState);
    if (isPlatformServer(this.platformId)) {
      this.transferState.set(this._stateKey, nextState);
    }
  }
}

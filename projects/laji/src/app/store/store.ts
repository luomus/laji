import { BehaviorSubject, Observable } from 'rxjs';

/**
 * @deprecated use facade patter instead
 */
export abstract class Store<T> {
  private _state$: BehaviorSubject<T>;

  protected constructor(
    name: string,
    initialState: T
  ) {
    this._state$ = new BehaviorSubject(initialState);
  }

  /**
   * @deprecated
   */
  get state$ (): Observable<T> {
    return this._state$.asObservable();
  }

  /**
   * @deprecated
   */
  get state (): T {
    return this._state$.getValue();
  }

  /**
   * @deprecated
   */
  setState (nextState: T): void {
    this._state$.next(nextState);
  }
}

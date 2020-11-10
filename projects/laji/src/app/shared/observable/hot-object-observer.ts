import { combineLatest, Observable, ObservableInput } from 'rxjs';
import { debounceTime, map, shareReplay } from 'rxjs/operators';

export function hotObjectObserver<T>(obj: { [K in keyof T]: ObservableInput<T[K]> }): Observable<T> {
  const keys = Object.keys(obj);

  return combineLatest(keys.map((key) => obj[key])).pipe(
    map<any, T>((values) => {
      const result: any = {};
      keys.forEach((key, i) => {
        result[key] = values[i];
      });

      return result;
    }),
    debounceTime(1),
    shareReplay({bufferSize: 1, refCount: true})
  );
}

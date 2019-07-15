import { combineLatest, Observable, ObservableInput } from 'rxjs';
import { map, share } from 'rxjs/operators';

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
    share()
  );
}

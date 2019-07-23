import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, retryWhen } from 'rxjs/operators';


const getErrorMessage = (maxRetry) => `Tried to load Resource over XHR for ${maxRetry} times without success. Giving up.`;

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF = 1000;

export function retryWithBackoff(delayMs: number, maxRetry = DEFAULT_MAX_RETRIES, backoffMs =  DEFAULT_BACKOFF) {
  let retries = maxRetry;

  return (src: Observable<any>) => src.pipe(
    retryWhen((errors: Observable<any>) => errors.pipe(
      mergeMap(error => {
        if (retries-- > 0) {
          return of(error).pipe(
            delay(
              delayMs + ((maxRetry - retries) * backoffMs)
            )
          );
        }
        return throwError(getErrorMessage(maxRetry));
      })
    ))
  );
}

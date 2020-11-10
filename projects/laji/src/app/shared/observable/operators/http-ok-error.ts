import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';


export function httpOkError(okErrorStatuses: number|number[], okErrorResponse: any) {
  const okStatus: number[] = Array.isArray(okErrorStatuses) ? okErrorStatuses : [okErrorStatuses];

  return (src: Observable<any>) => src.pipe(
    catchError(
      error => error instanceof HttpErrorResponse && error.status && okStatus.includes(error.status) ?
        of(okErrorResponse) :
        throwError(error)
    )
  );
}

import { Observable, Subject, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, throttleTime } from 'rxjs/operators';

const AUTH_ERRORS = ['Login Required', 'Invalid Token'];

@Injectable()
export class VirAuthenticatedHttpInterceptor implements HttpInterceptor {
  private needsRedirect$ = new Subject<void>();

  constructor(
    private userService: UserService
  ) {
    this.needsRedirect$.pipe(
      throttleTime(5000)
    ).subscribe(() => {
      this.userService.redirectToLogin();
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if ([401, 403].includes(err.status) && (AUTH_ERRORS.includes(err.error))) {
          this.needsRedirect$.next();
        }
        return observableThrowError(err);
        })
    );
  }
}

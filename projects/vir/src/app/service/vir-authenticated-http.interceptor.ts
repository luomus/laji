import { Observable, Subject, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, throttleTime } from 'rxjs/operators';

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
        if (err.status === 401 && err.error === 'Login Required') {
          this.needsRedirect$.next();
        }
        return observableThrowError(err);
        })
    );
  }
}

import { Observable, of, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { auditTime, catchError, switchMap, take, tap, timeout } from 'rxjs/operators';


@Injectable()
export class AuthenticatedHttpInterceptor implements HttpInterceptor {

  private checking = false;

  constructor(
    private userService: UserService
  ) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (!this.checking && environment.forceLogin && (err.status === 401 || err.status === 403)) {
              this.checking = true;
              this.userService.checkLogin().pipe(
                switchMap(() => this.userService.isLoggedIn$),
                timeout(30000),
                auditTime(20000),
                catchError(() => of(false)),
                take(1)
              ).subscribe(loggedIn => {
                if (!loggedIn) {
                  this.userService.redirectToLogin();
                } else {
                  this.checking = false;
                }
              });
            }
            return observableThrowError(err);
          }
        })
    );
  }
}

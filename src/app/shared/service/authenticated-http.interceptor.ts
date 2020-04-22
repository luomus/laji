import { Observable, of, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, take, tap, timeout } from 'rxjs/operators';
import { SessionStorage } from 'ngx-webstorage';


@Injectable()
export class AuthenticatedHttpInterceptor implements HttpInterceptor {

  @SessionStorage() private lastCheck;

  constructor(
    private userService: UserService
  ) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            const secPass = (Date.now() - (this.lastCheck || 0)) / 1000;
            if (secPass > 60 && environment.forceLogin && (err.status === 401 || err.status === 403)) {
              this.lastCheck = Date.now();
              this.userService.isLoggedIn$.pipe(
                timeout(10000),
                catchError(() => of(false)),
                take(1)
              ).subscribe(loggedIn => {
                if (!loggedIn) {
                  this.userService.redirectToLogin();
                }
              });
            }
            return observableThrowError(err);
          }
        })
    );
  }
}

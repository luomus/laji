import { Observable, Subject, throwError as observableThrowError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, throttleTime } from 'rxjs/operators';


@Injectable()
export class AuthenticatedHttpInterceptor implements HttpInterceptor {

  private throttle = new Subject();

  constructor(
    private userService: UserService
  ) {
    this.throttle.pipe(
      throttleTime(5000)
    ).subscribe(() => {
      this.userService.redirectToLogin();
    });
  }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (environment.forceLogin && (err.status === 401 || err.status === 403)) {
          this.throttle.next();
        }
        return observableThrowError(err);
        })
    );
  }
}

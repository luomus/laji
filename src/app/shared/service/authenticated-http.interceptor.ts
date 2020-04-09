import { Observable, throwError as observableThrowError } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { WINDOW } from '@ng-toolkit/universal';
import { switchMap, tap } from 'rxjs/operators';
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
              return this.userService.checkLogin().pipe(
                switchMap(() => observableThrowError(err))
              );
            } else {
              return observableThrowError(err);
            }
          }
        })
    );
  }
}

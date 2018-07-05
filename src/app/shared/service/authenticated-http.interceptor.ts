import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import { WINDOW } from '@ng-toolkit/universal';
import { tap } from 'rxjs/operators';


@Injectable()
export class AuthenticatedHttpInterceptor implements HttpInterceptor {

  constructor(@Inject(WINDOW) private window: Window) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (environment.forceLogin && (err.status === 401 || err.status === 403)) {
              this.window.location.href = UserService.getLoginUrl();
            } else {
              return observableThrowError(err);
            }
          }
        })
    );
  }
}

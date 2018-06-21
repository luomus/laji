import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WindowRef } from '../windows-ref';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';


@Injectable()
export class AuthenticatedHttpInterceptor implements HttpInterceptor {

  constructor(private winRef: WindowRef) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).do(
      (event: HttpEvent<any>) => {},
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (environment.forceLogin && (err.status === 401 || err.status === 403)) {
            this.winRef.nativeWindow.location.href = UserService.getLoginUrl();
          } else {
            return Observable.throw(err);
          }
        }
      });
  }
}

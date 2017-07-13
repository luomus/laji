import { Injectable } from '@angular/core';
import { Http, Request, RequestOptions, RequestOptionsArgs, Response, XHRBackend } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { WindowRef } from '../windows-ref';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';


@Injectable()
export class AuthenticatedHttpService extends Http {

  constructor(backend: XHRBackend,
              defaultOptions: RequestOptions,
              private winRef: WindowRef
  ) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((error: Response) => {
      if (environment.forceLogin && (error.status === 401 || error.status === 403)) {
        this.winRef.nativeWindow.location.href = UserService.getLoginUrl();
        return Observable.of(null).delay(3000);
      }
      return Observable.throw(error);
    });
  }
}

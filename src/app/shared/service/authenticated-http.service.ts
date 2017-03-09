import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { AppConfig } from '../../app.config';
import { WindowRef } from '../windows-ref';


@Injectable()
export class AuthenticatedHttpService extends Http {

  constructor(backend: XHRBackend,
              defaultOptions: RequestOptions,
              private appConfig: AppConfig,
              private winRef: WindowRef) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((error: Response) => {
      if (this.appConfig.isForcedLogin() && (error.status === 401 || error.status === 403)) {
        this.winRef.nativeWindow.location.href = this.appConfig.getLoginUrl();
        return Observable.of(null).delay(3000);
      }
      return Observable.throw(error);
    });
  }
}

import { Observable, of, Subject, throwError } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { filter, switchMap, take } from 'rxjs/operators';
import {
  isErrorResponse,
  LajiApiWorkerErrorResponse,
  LajiApiWorkerSuccessResponse,
  LOGOUT_MSG, REQUEST_MSG
} from './laji-api.worker';
import { PlatformService } from './platform.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class LajiApiInterceptor implements HttpInterceptor {
  private readonly responses = new Subject<LajiApiWorkerSuccessResponse | LajiApiWorkerErrorResponse>();
  private readonly worker: Worker;
  private readonly rnd: string;
  private id = 0;

  constructor(
    private userService: UserService,
    private platformService: PlatformService,
    private ngZone: NgZone,
    private translate: TranslateService
  ) {
    if (platformService.isServer) {
      return;
    }
    if (window.Worker) {
      this.rnd = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

      this.worker = new Worker('./laji-api.worker', {
        type: 'module'
      });

      this.worker.postMessage({key: this.rnd, loginUrl: UserService.getLoginUrl('/user/check', this.translate.currentLang)});

      this.worker.onmessage = ({data}) => {
        if (!data || typeof data !== 'object') {
          return;
        }
        if (data.type === LOGOUT_MSG) {
          this.userService.logout();
        }
        if (data.type === REQUEST_MSG) {
          this.ngZone.run(() => {
            this.responses.next(data);
          })
        }
      }
    }
  }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      this.platformService.isServer ||
      !this.worker ||
      !request.urlWithParams.startsWith(environment.apiBase)
    ) {
      return next.handle(request);
    }
    this.id++;
    if (this.id > 10000) {
      this.id = 0;
    }
    const id = this.id;
    const key = this.rnd;

    setTimeout(() => {
      this.worker.postMessage({id, key, request: {...request, url: request.urlWithParams, headers: this.getRequestHeaders(request)}});
    }, 0);

    return this.responses.pipe(
      filter(res => res.id === id),
      take(1),
      switchMap(res => isErrorResponse(res) ?
        throwError(new HttpErrorResponse({... res.error, error: res.error})) :
        of(new HttpResponse<any>(res.response))
      )
    );
  }

  private getRequestHeaders(request: HttpRequest<any>) {
    return request.headers.keys().reduce((response, key) => {
      response[key] = request.headers.getAll(key).join(',');
      return response;
    }, {'Content-Type': request.detectContentTypeHeader()});
  }
}

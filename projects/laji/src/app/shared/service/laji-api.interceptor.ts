import { forkJoin, Observable, of, Subject, throwError } from 'rxjs';
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
import { filter, skip, switchMap, take } from 'rxjs/operators';
import { PlatformService } from '../../shared-modules/platform/platform.service';
import { TranslateService } from '@ngx-translate/core';
import {
  CLEAR_TOKEN_MSG, hasPersonToken,
  isErrorResponse,
  LajiApiWorkerErrorResponse,
  LajiApiWorkerSuccessResponse,
  LOGOUT_MSG,
  REQUEST_MSG
} from './laji-api-worker-common';
import { BrowserService } from './browser.service';
import { FileService, IFileLoad } from '../../shared-modules/spreadsheet/service/file.service';

@Injectable()
export class LajiApiInterceptor implements HttpInterceptor {
  private readonly responses = new Subject<LajiApiWorkerSuccessResponse | LajiApiWorkerErrorResponse>();
  private readonly worker: Worker | undefined;
  private readonly rnd = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  private id = 0;

  constructor(
    private userService: UserService,
    private platformService: PlatformService,
    private browserService: BrowserService,
    private ngZone: NgZone,
    private translate: TranslateService,
    private fileService: FileService
  ) {
    if (platformService.isServer || !platformService.canUseWebWorkerLogin) {
      return;
    }
    this.worker = new Worker(new URL('./laji-api.worker', import.meta.url), {type: 'module'});

    this.worker.postMessage({
      key: this.rnd,
      loginUrl: UserService.getLoginUrl('/', this.translate.currentLang, environment.loginCheck)
    });
    this.worker.onmessage = ({data}) => {
      if (!data || typeof data !== 'object') {
        return;
      }
      if (data.type === LOGOUT_MSG) {
        this.ngZone.run(() => {
          this.userService.logout();
        });
      }
      if (data.type === REQUEST_MSG) {
        this.ngZone.run(() => {
          this.responses.next(data);
        });
      }
    };

    // Worker doesn't know when the personToken changes in another tap so it should check it when ever visibility changes
    // Login reloads the window so no need to worry about that
    this.browserService.visibility$.pipe(
      skip(1),
      filter(visible => visible)
    ).subscribe(() => this.worker?.postMessage({key: this.rnd, type: CLEAR_TOKEN_MSG}));
  }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.shouldUseWorker(request)) {
      return next.handle(request);
    }
    this.id++;
    if (this.id > 10000) {
      this.id = 0;
    }
    const id = this.id;
    const key = this.rnd;

    setTimeout(() => {
      if (request.body instanceof FormData) {
        const data: Observable<IFileLoad>[] = [];
        request.body.forEach(e => data.push(this.fileService.loadFile(e as File, undefined, {type: 'dataUrl'})));

        forkJoin(data).subscribe(d => {
          this.worker?.postMessage({id, key, request: {...request.clone({body: ''}), dataUrls: d, url: request.urlWithParams, headers: this.getRequestHeaders(request)}});
        });
      } else {
        this.worker?.postMessage({id, key, request: {...request, url: request.urlWithParams, headers: this.getRequestHeaders(request)}});
      }
    }, 0);

    return this.responses.pipe(
      filter(res => res.id === id),
      take(1),
      switchMap(res => isErrorResponse(res) ?
        throwError(new HttpErrorResponse({...res.error, error: res.error})) :
        of(new HttpResponse<any>(res.response))
      )
    );
  }

  private shouldUseWorker(request: HttpRequest<any>): boolean {
    if (
      this.platformService.isServer ||
      !this.platformService.canUseWebWorkerLogin ||
      !(request.urlWithParams.startsWith(environment.apiBase) || request.urlWithParams.startsWith(environment.kerttuApi))
    ) {
      return false;
    }
    return hasPersonToken(request);
  }

  private getRequestHeaders(request: HttpRequest<any>) {
    return request.headers.keys().reduce((response, key) => {
      const lower = key.toLowerCase();
      if (response[lower]) {
        delete response[lower];
      }
      const headers = request.headers.getAll(key);
      if (headers) {
        response[key] = headers.join(',');
      }
      return response;
    }, (['POST', 'PUT', 'PATCH'].includes(request.method) ?
      {'content-type': request.detectContentTypeHeader()} :
      {} as any));
  }
}

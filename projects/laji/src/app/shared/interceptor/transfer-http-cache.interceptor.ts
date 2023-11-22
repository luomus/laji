/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { ApplicationRef, Injectable, StateKey, TransferState, makeStateKey } from '@angular/core';
import { Observable, of, of as observableOf } from 'rxjs';
import { catchError, filter, take, tap, timeout } from 'rxjs/operators';
import { PlatformService } from '../../root/platform.service';

export interface TransferHttpResponse {
  body?: any | null;
  headers?: {[k: string]: string[]};
  status?: number;
  statusText?: string;
  url?: string;
}

function getHeadersMap(headers: HttpHeaders) {
  const headersMap: Record<string, string[] | null> = {};
  for (const key of headers.keys()) {
    headersMap[key] = headers.getAll(key);
  }

  return headersMap;
}

@Injectable()
export class TransferHttpCacheInterceptor implements HttpInterceptor {

  private isCacheActive = true;

  private makeCacheKey(method: string, url: string, params: HttpParams): StateKey<string> {
    // make the params encoded same as a url so it's easy to identify
    const encodedParams = params.keys().sort().map(k => `${k}=${params.get(k)}`).join('&');
    const key = (method === 'GET' ? 'G.' : 'H.') + url + '?' + encodedParams;

    return makeStateKey(key);
  }

  constructor(
    private appRef: ApplicationRef,
    private transferState: TransferState,
    private platformService: PlatformService
  ) {
    // Stop using the cache if the application has stabilized, indicating initial rendering is
    // complete.
    this.getStableObservable().toPromise()
      .then(() => { this.isCacheActive = false; });
  }

  private getStableObservable() {
    const stable$ = this.appRef.isStable.pipe(
      filter((isStable: boolean) => isStable),
      take(1)
    );
    if (this.platformService.isBrowser) {
      return stable$.pipe(
        timeout(5000),
        catchError(() => of(null))
      );
    }
    return stable$;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || !this.isCacheActive) {
      return next.handle(req);
    }

    const storeKey = this.makeCacheKey(req.method, req.url, req.params);

    if (this.transferState.hasKey(storeKey)) {
      // Request found in cache. Respond using it.
      const response = this.transferState.get<any>(storeKey, {} as TransferHttpResponse);

      return observableOf(new HttpResponse<any>({
        body: response.body,
        headers: new HttpHeaders(response.headers),
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      }));
    } else {
      // Request not found in cache. Make the request and cache it.
      const httpEvent = next.handle(req);

      return httpEvent.pipe(
        tap((event: HttpEvent<unknown>) => {
          if (event instanceof HttpResponse) {
            this.transferState.set<any>(storeKey, {
              body: event.body,
              headers: getHeadersMap(event.headers),
              status: event.status,
              statusText: event.statusText,
              url: event.url || '',
            });
          }
        })
      );
    }
  }
}

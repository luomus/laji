import { Injectable } from '@angular/core';
import { PlatformService } from '../service/platform.service';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

const SSR_TIMEOUT = 1000;
const GLOBAL_TIMEOUT = 30000;

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  constructor(
    private platformService: PlatformService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const timeoutValue = this.platformService.isServer ? SSR_TIMEOUT : Number(req.headers.get('timeout')) || GLOBAL_TIMEOUT;

    return next.handle(req).pipe(timeout(timeoutValue));
  }
}

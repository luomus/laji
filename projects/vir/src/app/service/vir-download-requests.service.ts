import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { DownloadRequest } from '../../../../laji/src/app/shared-modules/download-request/models';

@Injectable({providedIn: 'root'})
export class VirDownloadRequestsService {
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  findDownloadRequests(): Observable<DownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<DownloadRequest[]>('/api/warehouse/downloads')),
        shareReplay(1)
    );
  }

  findApiKeys(): Observable<DownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<DownloadRequest[]>('/api/warehouse/api-keys')),
        shareReplay(1)
    );
  }

  findMyDownloadRequests(): Observable<DownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(() => this.httpClient.get<DownloadRequest[]>('/api/warehouse/downloads', {params: {personToken: this.userService.getToken()}})),
      map(data => data.filter(d => ['AUTHORITIES_FULL', 'AUTHORITIES_LIGHTWEIGHT'].includes(d.downloadType))),
      shareReplay(1)
    );
  }

  findMyApiKeys(): Observable<DownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(() => this.httpClient.get<DownloadRequest[]>('/api/warehouse/api-keys', {params: {personToken: this.userService.getToken()}})),
      shareReplay(1)
    );
  }
}

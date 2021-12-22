import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';

export interface IDownloadRequest {
  id: string;
  requested: string;
  downloadType: string;
  source: string;
  personId: string;
  dataUsePurpose: string;
  approximateMatches: string;
  filters: {[key: string]: any}[];
  filterDescriptions: {[lang: string]: {label: string, value: string}[]};
  privateLink: {[lang: string]: string}[];
  publicLink: {[lang: string]: string}[];
  collectionId?: string[];
  collections?: {id: string}[]
  collectionSearch?: string[];
  rootCollections?: string[];
  apiKeyExpires?: string;
  apiKey?: string;
}

@Injectable({providedIn: 'root'})
export class VirDownloadRequestsService {
  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  findDownloadRequests(): Observable<IDownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<IDownloadRequest[]>('/api/warehouse/downloads')),
        shareReplay(1)
    );
  }

  findApiKeys(): Observable<IDownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
        filter(loggedIn => loggedIn),
        switchMap(() => this.httpClient.get<IDownloadRequest[]>('/api/warehouse/api-keys')),
        shareReplay(1)
    );
  }

  findMyDownloadRequests(): Observable<IDownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(() => this.httpClient.get<IDownloadRequest[]>('/api/warehouse/downloads', {params: {personToken: this.userService.getToken()}})),
      map(data => data.filter(d => ['AUTHORITIES_FULL', 'AUTHORITIES_LIGHTWEIGHT'].includes(d.downloadType))),
      shareReplay(1)
    );
  }

  findMyApiKeys(): Observable<IDownloadRequest[]> {
    return this.userService.isLoggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(() => this.httpClient.get<IDownloadRequest[]>('/api/warehouse/api-keys', {params: {personToken: this.userService.getToken()}})),
      shareReplay(1)
    );
  }
}

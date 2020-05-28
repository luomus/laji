import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, shareReplay, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../../src/app/shared/service/user.service';

export interface IDownloadRequest {
  id: string;
  requested: string;
  downloadType: string;
  source: string;
  person: string;
  dataUsePurpose: string;
  collectionId: string[];
  rootCollections: string[];
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
        switchMap(() => this.httpClient.get<IDownloadRequest[]>('/api/download-requests', {params: {token: this.userService.getToken()}})),
        shareReplay(1)
    )
  }

}

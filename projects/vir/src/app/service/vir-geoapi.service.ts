import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

export interface GeoapiKeyRequestResponse {
  apiKey: string;
}

export interface GeoapiKeyRequest {
  requested: string;
  personId: string;
  dataUsePurpose: string;
  apiKeyExpires: string;
  apiKey?: string;
}

@Injectable({providedIn: 'root'})
export class VirGeoapiService {
  constructor(
    private userService: UserService,
    private httpClient: HttpClient
  ) {}

  requestApiKey(dataUsePurpose: string, apiKeyExpires: number): Observable<GeoapiKeyRequestResponse> {
    const personToken = this.userService.getToken();
    return this.httpClient.post<GeoapiKeyRequestResponse>(
      '/api/geoapi/api-key-request',
      { personToken, dataUsePurpose, apiKeyExpires }
    );
  }

  findApiKeys(): Observable<GeoapiKeyRequest[]> {
    return this.httpClient.get<GeoapiKeyRequest[]>('/api/geoapi/api-keys');
  }

  findMyApiKeys(): Observable<GeoapiKeyRequest[]> {
    return this.userService.isLoggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(() => this.httpClient.get<GeoapiKeyRequest[]>(
        '/api/geoapi/api-keys', { params: { personToken: this.userService.getToken() }}
      )),
      take(1)
    );
  }
}

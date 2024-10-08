import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';

export interface ApiKeyRequestResponse {
  apiKey: string;
}

@Injectable({providedIn: 'root'})
export class VirGeoapiService {
  constructor(
    private userService: UserService,
    private httpClient: HttpClient
  ) {}

  requestApiKey(dataUsePurpose: string, apiKeyExpires: number) {
    const personToken = this.userService.getToken();
    return this.httpClient.post<ApiKeyRequestResponse>(
      '/api/geoapi/api-key-request',
      { personToken, dataUsePurpose, apiKeyExpires }
    );
  }

  findApiKeys() {
    return this.httpClient.get<any[]>('/api/geoapi/api-keys');
  }

  findMyApiKeys() {
    const personToken = this.userService.getToken();
    return this.httpClient.get<any[]>('/api/geoapi/api-keys', { params: { personToken }});
  }
}

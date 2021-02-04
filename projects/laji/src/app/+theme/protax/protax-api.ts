import {HttpClient, HttpEvent} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class ProtaxApi {
  protected basePath = environment.protaxApi;

  constructor(protected httpClient: HttpClient) {
  }

  public analyse(data: FormData): Observable<HttpEvent<ArrayBuffer>> {
    const path = this.basePath + '/analyse';

    return this.httpClient.post(path, data,  {responseType: 'arraybuffer', reportProgress: true, observe: 'events'});
  }
}

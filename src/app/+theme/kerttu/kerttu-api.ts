import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {Step} from './kerttu.facade';
import {map} from 'rxjs/operators';

@Injectable()
export class KerttuApi {
  protected basePath = environment.kerttuApi;

  constructor(protected httpClient: HttpClient) {
  }

  public getStatus(personToken: string): Observable<number> {
    const path = this.basePath + '/status/' + personToken;

    return this.httpClient.get<{'status': number}>(path)
      .pipe(
        map((response: Response) => {
          return response.status;
        })
      );
  }

  public setStatus(personToken: string, status: Step): Observable<number> {
    const path = this.basePath + '/status/' + personToken;

    return this.httpClient.put<{'status': number}>(path, {status})
      .pipe(
        map((response: Response) => {
          return response.status;
        })
      );
  }
}

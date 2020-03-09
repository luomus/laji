import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {Step} from './kerttu.facade';
import { IRecordingWithCandidates } from './model/recording';

@Injectable()
export class KerttuApi {
  protected basePath = environment.kerttuApi;

  constructor(protected httpClient: HttpClient) {
  }

  public getStatus(personToken: string): Observable<number> {
    const path = this.basePath + '/status/' + personToken;

    return this.httpClient.get(path)
      .pipe(
        map((response: {status: number}) => {
          return response.status;
        })
      );
  }

  public setStatus(personToken: string, status: Step): Observable<number> {
    const path = this.basePath + '/status/' + personToken;

    return this.httpClient.put(path, {status})
      .pipe(
        map((response: {status: number}) => {
          return response.status;
        })
      );
  }

  public getLetterCandidates(personToken: string): Observable<IRecordingWithCandidates> {
    const path = this.basePath + '/letters/' + personToken;

    return this.httpClient.get(path)
      .pipe(
        map((response: {letters: IRecordingWithCandidates}) => {
          return response.letters;
        })
      );
  }
}

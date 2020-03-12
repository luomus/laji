import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {Step} from './kerttu.facade';
import { IRecordingWithCandidates } from './model/recording';
import {ILetterAnnotations} from './model/annotation';

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

    return this.httpClient.put(path, { status })
      .pipe(
        map((response: {status: number}) => {
          return response.status;
        })
      );
  }

  public getLetterCandidateTaxonList(personToken: string): Observable<string[]> {
    const path = this.basePath + '/letters/taxa';

    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: {taxa: string[]}) => {
          return response.taxa;
        })
      );
  }

  public getLetterCandidates(taxonId: string, personToken: string): Observable<IRecordingWithCandidates[]> {
    const path = this.basePath + '/letters/' + taxonId;

    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: {letters: IRecordingWithCandidates[]}) => {
          return response.letters;
        })
      );
  }

  public updateLetterAnnotations(taxonId: string, annotations: ILetterAnnotations, personToken: string): Observable<boolean> {
    const path = this.basePath + '/letters/annotations/' + taxonId;

    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post(path, annotations, { params })
      .pipe(
        map((response: {success: boolean}) => {
          return response.success;
        })
      );
  }
}

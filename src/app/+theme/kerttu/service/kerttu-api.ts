import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {Step} from './kerttu.facade';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation} from '../model/letter';

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

  public getNextLetterTemplate(personToken: string): Observable<ILetterTemplate> {
    const path = this.basePath + '/letter/nextTemplate';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterTemplate) => {
          return response;
        })
      );
  }

  public getNextLetterCandidate(personToken: string, templateId: number): Observable<ILetterCandidate> {
    const path = this.basePath + '/letter/nextCandidate/' + templateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterCandidate) => {
          return response;
        })
      );
  }

  public setLetterAnnotation(personToken: string, templateId: number, candidateId: number, annotation: LetterAnnotation): Observable<ILetterCandidate> {
    const path = this.basePath + '/letter/annotation/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put(path, { annotation }, { params })
      .pipe(
        map((response: ILetterCandidate) => {
          return response;
        })
      );
  }

  public skipLetterTemplate(personToken: string, templateId: number): Observable<ILetterTemplate> {
    const path = this.basePath + '/letter/skipTemplate';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put(path, { templateId }, { params })
      .pipe(
        map((response: ILetterTemplate) => {
          return response;
        })
      );
  }
}

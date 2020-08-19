import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation, ILetterInfo} from '../model/letter';

@Injectable()
export class KerttuApi {
  protected basePath = environment.kerttuApi;

  constructor(protected httpClient: HttpClient) {
  }

  public getLetterTemplate(personToken: string): Observable<ILetterTemplate> {
    const path = this.basePath + '/letter/template';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterTemplate) => {
          return response;
        })
      );
  }

  public getLetterCandidate(personToken: string, templateId: number): Observable<ILetterCandidate> {
    const path = this.basePath + '/letter/candidate/' + templateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterCandidate) => {
          return response;
        })
      );
  }

  public getNextLetterCandidate(personToken: string, templateId: number, candidateId: number): Observable<ILetterCandidate> {
    const path = this.basePath + '/letter/nextCandidate/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterCandidate) => {
          return response;
        })
      );
  }

  public setLetterAnnotation(personToken: string, templateId: number, candidateId: number, annotation: LetterAnnotation):
    Observable<{annotation: LetterAnnotation, info: ILetterInfo}> {
    const path = this.basePath + '/letter/annotation/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put(path, { annotation }, { params })
      .pipe(
        map((response: {annotation: LetterAnnotation, info: ILetterInfo}) => {
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

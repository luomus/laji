import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation, ILetterStatusInfo} from '../model/letter';

interface ILetterResponse {
  statusInfo: ILetterStatusInfo;
}
interface ILetterTemplateResponse extends ILetterResponse {
  template: ILetterTemplate;
}
interface ILetterCandidateResponse extends ILetterResponse {
  candidate: ILetterCandidate;
}
interface ILetterAnnotationResponse extends ILetterResponse {
  annotation: LetterAnnotation;
}

@Injectable()
export class KerttuApi {
  protected basePath = environment.kerttuApi;

  constructor(protected httpClient: HttpClient) {
  }

  public getLetterTemplate(personToken: string): Observable<ILetterTemplateResponse> {
    const path = this.basePath + '/letter/template';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterTemplateResponse) => {
          return response;
        })
      );
  }

  public getLetterCandidate(personToken: string, templateId: number): Observable<ILetterCandidateResponse> {
    const path = this.basePath + '/letter/candidate/' + templateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterCandidateResponse) => {
          return response;
        })
      );
  }

  public getNextLetterCandidate(personToken: string, templateId: number, candidateId: number): Observable<ILetterCandidateResponse> {
    const path = this.basePath + '/letter/nextCandidate/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterCandidateResponse) => {
          return response;
        })
      );
  }

  public getPreviousLetterCandidate(personToken: string, templateId: number, candidateId: number): Observable<ILetterCandidateResponse> {
    const path = this.basePath + '/letter/previousCandidate/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetterCandidateResponse) => {
          return response;
        })
      );
  }

  public setLetterAnnotation(personToken: string, templateId: number, candidateId: number, annotation: LetterAnnotation): Observable<ILetterAnnotationResponse> {
    const path = this.basePath + '/letter/annotation/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put(path, { annotation }, { params })
      .pipe(
        map((response: ILetterAnnotationResponse) => {
          return response;
        })
      );
  }

  public skipLetterTemplate(personToken: string, templateId: number): Observable<ILetterTemplateResponse> {
    const path = this.basePath + '/letter/skipTemplate';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put(path, { templateId }, { params })
      .pipe(
        map((response: ILetterTemplateResponse) => {
          return response;
        })
      );
  }
}

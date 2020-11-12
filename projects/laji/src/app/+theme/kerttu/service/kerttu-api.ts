import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation, ILetterStatusInfo, IRecording, IRecordingAnnotation} from '../models';

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

    return this.httpClient.get<ILetterTemplateResponse>(path, { params });
  }

  public getLetterCandidate(personToken: string, templateId: number): Observable<ILetterCandidateResponse> {
    const path = this.basePath + '/letter/candidate/' + templateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<ILetterCandidateResponse>(path, { params });
  }

  public getNextLetterCandidate(personToken: string, templateId: number, candidateId: number): Observable<ILetterCandidateResponse> {
    const path = this.basePath + '/letter/nextCandidate/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<ILetterCandidateResponse>(path, { params });
  }

  public getPreviousLetterCandidate(personToken: string, templateId: number, candidateId: number): Observable<ILetterCandidateResponse> {
    const path = this.basePath + '/letter/previousCandidate/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<ILetterCandidateResponse>(path, { params });
  }

  public setLetterAnnotation(personToken: string, templateId: number, candidateId: number, annotation: LetterAnnotation): Observable<ILetterAnnotationResponse> {
    const path = this.basePath + '/letter/annotation/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put<ILetterAnnotationResponse>(path, { annotation }, { params });
  }

  public skipLetterTemplate(personToken: string, templateId: number): Observable<ILetterTemplateResponse> {
    const path = this.basePath + '/letter/skipTemplate';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put<ILetterTemplateResponse>(path, { templateId }, { params });
  }

  public getRecording(personToken: string): Observable<IRecording> {
    const path = this.basePath + '/recording';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IRecording>(path, { params });
  }

  public getNextRecording(personToken: string): Observable<IRecording> {
    const path = this.basePath + '/recording/next';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IRecording>(path, { params });
  }

  public getRecordingAnnotation(personToken: string, recordingId: number): Observable<IRecordingAnnotation> {
    const path = this.basePath + '/recording/annotation/' + recordingId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IRecordingAnnotation>(path, { params });
  }

  public setRecordingAnnotation(personToken: string, recordingId: number, annotation: IRecordingAnnotation) {
    const path = this.basePath + '/recording/annotation/' + recordingId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post(path, annotation, { params });
  }
}

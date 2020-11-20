import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {ILetterCandidate, ILetterTemplate, LetterAnnotation, ILetterStatusInfo, IRecording, IRecordingAnnotation, KerttuErrorEnum, IRecordingStatusInfo} from '../models';

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
interface IRecordingResponse {
  statusInfo: IRecordingStatusInfo;
  annotation: IRecordingAnnotation;
  recording: IRecording;
}

@Injectable()
export class KerttuApi {

  constructor(protected httpClient: HttpClient) {
  }
  protected basePath = environment.kerttuApi;

  public static getErrorMessage(error): KerttuErrorEnum {
    while (error.error) {
      error = error.error;
    }
    return error.message || error.body?.message;
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

  public getRecording(personToken: string): Observable<IRecordingResponse> {
    const path = this.basePath + '/recording';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IRecordingResponse>(path, { params });
  }

  public getNextRecording(personToken: string, recordingId: number): Observable<IRecordingResponse> {
    const path = this.basePath + '/recording/next/' + recordingId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IRecordingResponse>(path, { params });
  }

  public getPreviousRecording(personToken: string, recordingId: number): Observable<IRecordingResponse> {
    const path = this.basePath + '/recording/previous/' + recordingId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get<IRecordingResponse>(path, { params });
  }

  public saveRecordingAnnotation(personToken: string, recordingId: number, annotation: IRecordingAnnotation) {
    const path = this.basePath + '/recording/annotation/' + recordingId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post(path, annotation, { params });
  }
}

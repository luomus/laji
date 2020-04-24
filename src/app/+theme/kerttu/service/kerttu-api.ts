import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {Step} from './kerttu.facade';
import {ILetter, ILetterTemplate, LetterAnnotation} from '../model/letter';

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

  public getNextLetterCandidate(personToken: string, templateId: number): Observable<ILetter> {
    const path = this.basePath + '/letter/' + templateId + '/nextCandidate';
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: ILetter) => {
          return response;
        })
      );
  }

  public setLetterAnnotation(personToken: string, templateId: number, candidateId: number, annotation: LetterAnnotation): Observable<LetterAnnotation> {
    const path = this.basePath + '/letter/annotation/' + templateId + '/' + candidateId;
    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.put(path, { annotation }, { params })
      .pipe(
        map((response: {annotation: LetterAnnotation}) => {
          return response.annotation;
        })
      );
  }

  /*
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

  public getLetterAnnotations(taxonId: string, personToken: string): Observable<ILetterAnnotations> {
    const path = this.basePath + '/letters/annotations/' + taxonId;

    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: {annotations: ILetterAnnotations}) => {
          return response.annotations;
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

  public getRecordings(taxonIds: string[], personToken: string): Observable<IRecording[]> {
    const path = this.basePath + '/recordings';

    const params = new HttpParams().set('personToken', personToken).set('taxonId', taxonIds.join(','));

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: {recordings: IRecording[]}) => {
          return response.recordings;
        })
      );
  }
  public getRecordingAnnotations(personToken: string): Observable<IRecordingAnnotations> {
    const path = this.basePath + '/recordings/annotations';

    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.get(path, { params })
      .pipe(
        map((response: {annotations: IRecordingAnnotations}) => {
          return response.annotations;
        })
      );
  }

  public updateRecordingAnnotations(annotations: IRecordingAnnotations, personToken: string): Observable<boolean> {
    const path = this.basePath + '/recordings/annotations';

    const params = new HttpParams().set('personToken', personToken);

    return this.httpClient.post(path, annotations, { params })
      .pipe(
        map((response: {success: boolean}) => {
          return response.success;
        })
      );
  }
  */
}

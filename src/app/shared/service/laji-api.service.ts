import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';
import {PagedResult} from '../model';
import {Annotation} from '../model/Annotation';

@Injectable()
export class LajiApiService {

  constructor(private httpClient: HttpClient) { }

  get(endpoint: LajiApi.Endpoints.annotations, query: LajiApi.Query.AnnotationQuery): Observable<LajiApi.Response.AnnotationListResponse>;
  get(endpoint: LajiApi.Endpoints, query: object = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options = { params: {...query} };
    return this.httpClient.get(url, options);
  }

  post(endpoint: LajiApi.Endpoints.htmlToPdf, data: any): Observable<LajiApi.Response.HtmlToPdf>;
  post(endpoint: LajiApi.Endpoints, data: any, query: object = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options = { params: {...query} };
    if (endpoint === LajiApi.Endpoints.htmlToPdf) {
      options['responseType'] = 'blob';
    }
    return this.httpClient.post(
      url,
      data,
      options
    );
  }
}

export namespace LajiApi {
  export enum Endpoints {
    htmlToPdf = 'html-to-pdf',
    annotations = 'annotations',
  }

  export namespace Query {

    interface Paged {
      page?: number;
      pageSize?: number;
    }

    export interface AnnotationQuery extends Paged {
      personToken: string;
      rootID: string;
    }
  }

  export namespace Response {
    export interface HtmlToPdf {
      base64pdf: string
    }

    export interface AnnotationListResponse extends PagedResult<Annotation> {
    }
  }

  export interface Query {
    lang?: string;
    informalGroupFilters?: string;
    invasiveSpeciesFilter?: boolean;
    pageSize?: number;
    onlyFinnish?: boolean;
    blacklist?: string;
  }

}

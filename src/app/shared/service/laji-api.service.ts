import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';

@Injectable()
export class LajiApiService {

  constructor(private httpClient: HttpClient) { }

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
    htmlToPdf = 'html-to-pdf'
  }

  export namespace Query {

  }

  export namespace Response {
    export interface HtmlToPdf {
      base64pdf: string
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

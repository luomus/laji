/* tslint:disable:max-line-length */

import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {environment} from '../../../environments/environment';
import {PagedResult} from '../model';
import {Annotation} from '../model/Annotation';
import {Notification} from '../model/Notification';
import {Information} from '../model/Information';

@Injectable()
export class LajiApiService {

  constructor(private httpClient: HttpClient) { }

  getList(endpoint: LajiApi.Endpoints.annotations, query: LajiApi.Query.AnnotationQuery): Observable<LajiApi.Response.AnnotationListResponse>;
  getList(endpoint: LajiApi.Endpoints.documentStats, query: LajiApi.Query.DocumentStatsQuery): Observable<LajiApi.Response.DocumentStats>;
  getList(endpoint: LajiApi.Endpoints.information, query: LajiApi.Query.InformationQuery): Observable<Information>;
  getList(endpoint: LajiApi.Endpoints.notifications, query: LajiApi.Query.NotificationListQuery): Observable<LajiApi.Response.NotificationListResponse>;
  getList(endpoint: LajiApi.Endpoints, query: object = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options = { params: {...query} };
    return this.httpClient.get(url, options);
  }

  get(endpoint: LajiApi.Endpoints.information, id: string, query: LajiApi.Query.InformationQuery): Observable<Information>;
  get(endpoint: LajiApi.Endpoints, id: string, query: object = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}/${id}`;
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

  update(endpoint: LajiApi.Endpoints.notifications, data: Notification, query: LajiApi.Query.NotificationQuery): Observable<Notification>;
  update(endpoint: LajiApi.Endpoints, data: any, query: object = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}/${data.id}`;
    const options = { params: {...query} };
    return this.httpClient.put(
      url,
      data,
      options
    );
  }

  remove(endpoint: LajiApi.Endpoints.notifications, id: string, query: LajiApi.Query.NotificationQuery): Observable<any>;
  remove(endpoint: LajiApi.Endpoints, id: string, query: object = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options = { params: {...query} };
    return this.httpClient.delete(
      url,
      options
    );
  }
}

export namespace LajiApi {
  export enum Endpoints {
    annotations = 'annotations',
    documentStats = 'documents/stats',
    htmlToPdf = 'html-to-pdf',
    information = 'information',
    notifications = 'notifications'
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

    export interface DocumentStatsQuery {
      personToken: string;
      namedPlace: string;
    }

    export interface NotificationListQuery extends Paged {
      personToken: string;
      onlyUnSeen?: boolean;
    }

    export interface NotificationQuery {
      personToken: string;
    }

    export interface InformationQuery {
      lang?: string;
    }
  }

  export namespace Response {
    export interface DocumentStats {
      dateMedian: string;
    }

    export interface HtmlToPdf {
      base64pdf: string
    }

    export interface AnnotationListResponse extends PagedResult<Annotation> {
    }

    export interface NotificationListResponse extends PagedResult<Notification> {

    }
  }

}

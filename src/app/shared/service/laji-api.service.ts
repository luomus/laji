/* tslint:disable:max-line-length no-empty-interface */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../environments/environment';
import { Area, Autocomplete, PagedResult, Source } from '../model';
import { Annotation } from '../model/Annotation';
import { Notification } from '../model/Notification';
import { Information } from '../model/Information';
import { Publication } from '../model/Publication';
import { Feedback } from '../model/Feedback';
import * as models from '../model';
import { News } from '../model/News';

@Injectable()
export class LajiApiService {

  constructor(private httpClient: HttpClient) { }

  getList(endpoint: LajiApi.Endpoints.annotations, query: LajiApi.Query.AnnotationQuery): Observable<LajiApi.Response.AnnotationListResponse>;
  getList(endpoint: LajiApi.Endpoints.areas, query: LajiApi.Query.AreaQuery): Observable<LajiApi.Response.AreaListResponse>;
  getList(endpoint: LajiApi.Endpoints.documentStats, query: LajiApi.Query.DocumentStatsQuery): Observable<LajiApi.Response.DocumentStats>;
  getList(endpoint: LajiApi.Endpoints.forms, query: LajiApi.Query.FormsListQuery): Observable<LajiApi.Response.FormsListResponse>;
  getList(endpoint: LajiApi.Endpoints.information, query: LajiApi.Query.InformationQuery): Observable<Information>;
  getList(endpoint: LajiApi.Endpoints.news, query: LajiApi.Query.NewsQuery): Observable<LajiApi.Response.NewsListResponse>;
  getList(endpoint: LajiApi.Endpoints.notifications, query: LajiApi.Query.NotificationListQuery): Observable<LajiApi.Response.NotificationListResponse>;
  getList(endpoint: LajiApi.Endpoints.sources, query: LajiApi.Query.SourceQuery): Observable<LajiApi.Response.SourceListResponse>;
  getList<T>(endpoint: LajiApi.Endpoints, query: object = {}): Observable<T> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options = { params: {...query} };
    return this.httpClient.get<T>(url, options);
  }

  get(endpoint: LajiApi.Endpoints.autocomplete, id: LajiApi.AutocompleteField, query: LajiApi.Query.AutocompleteQuery): Observable<Autocomplete[]>;
  get(endpoint: LajiApi.Endpoints.forms, id: string, query: LajiApi.Query.FormsQuery): Observable<any>;
  get(endpoint: LajiApi.Endpoints.information, id: string, query: LajiApi.Query.InformationQuery): Observable<Information>;
  get(endpoint: LajiApi.Endpoints.news, id: string): Observable<News>;
  get(endpoint: LajiApi.Endpoints.publications, id: string, query: LajiApi.Query.PublicationQuery): Observable<Publication>;
  get<T>(endpoint: LajiApi.Endpoints, id: string, query: object = {}): Observable<T> {
    const url = `${environment.apiBase}/${endpoint}/${id}`;
    const options = { params: {...query} };
    return this.httpClient.get<T>(url, options);
  }

  post(endpoint: LajiApi.Endpoints.feedback, data: Feedback, query: LajiApi.Query.FeedbackQuery): Observable<void>;
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

  remove(endpoint: LajiApi.Endpoints.personToken, id: string): Observable<void>;
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
    areas = 'areas',
    autocomplete = 'autocomplete',
    documentStats = 'documents/stats',
    feedback = 'feedback',
    forms = 'forms',
    htmlToPdf = 'html-to-pdf',
    information = 'information',
    news = 'news',
    notifications = 'notifications',
    personToken = 'person-token',
    publications = 'publications',
    sources = 'sources',
  }

  export type AutocompleteField = 'taxon'|'collection'|'friends'|'unit'|'person';

  export enum AreaType {
    country = 'country',
    biogeographicalProvince = 'biogeographicalProvince',
    municipality = 'municipality',
    oldMunicipality = 'oldMunicipality',
    birdAssociationArea = 'birdAssociationArea',
    iucnEvaluationArea = 'iucnEvaluationArea'
  }

  export enum AutocompleteMatchType {
    exact = <any> 'exact',
    partial = <any> 'exact,partial',
    likely = <any> 'exact,likely'
  }

  export namespace Query {

    interface Paged {
      page?: number;
      pageSize?: number;
    }

    interface Lang {
      lang?: string;
    }

    interface PersonToken {
      personToken: string;
    }

    interface LangWithFallback extends Lang {
      langFallback?: boolean;
    }

    export interface AnnotationQuery extends Paged, PersonToken {
      rootID: string;
    }

    export interface AreaQuery extends Lang, Paged {
      type?: LajiApi.AreaType,
      idIn?: string;
    }

    export interface AutocompleteQuery {
      q?: string;
      limit?: string;
      includePayload?: boolean;
      includeSelf?: boolean;
      lang?: string;
      checklist?: string;
      informalTaxonGroup?: string;
      personToken?: string;
      matchType?: LajiApi.AutocompleteMatchType;
      onlySpecies?: boolean;
      onlyFinnish?: boolean;
      excludeNameTypes?: string;
      formID?: string;
    }

    export interface DocumentStatsQuery extends PersonToken {
      namedPlace: string;
    }

    export interface FeedbackQuery extends PersonToken { }

    export interface FormsQuery extends Lang {
      format?: 'json'|'schema';
    }

    export interface FormsListQuery extends Lang, Paged { }

    export interface NotificationListQuery extends Paged, PersonToken {
      onlyUnSeen?: boolean;
    }

    export interface NewsQuery extends Lang, Paged {
      tag?: string;
    }

    export interface NotificationQuery extends PersonToken { }

    export interface InformationQuery extends Lang { }

    export interface PublicationQuery extends LangWithFallback { }

    export interface SourceQuery extends LangWithFallback, Paged {
      idIn?: string;
    }
  }

  export namespace Response {
    export interface DocumentStats {
      dateMedian: string;
    }

    export interface HtmlToPdf {
      base64pdf: string
    }

    export interface AnnotationListResponse extends PagedResult<Annotation> { }

    export interface AreaListResponse extends PagedResult<Area> { }

    export interface NewsListResponse extends PagedResult<News> { }

    export interface FormsListResponse extends PagedResult<models.Form.List> { }

    export interface NotificationListResponse extends PagedResult<Notification> { }

    export interface SourceListResponse extends PagedResult<Source> { }
  }

}

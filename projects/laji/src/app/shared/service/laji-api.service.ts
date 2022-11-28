/* eslint-disable max-len */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Area } from '../model/Area';
import { Autocomplete } from '../model/Autocomplete';
import { Checklist } from '../model/Checklist';
import { PagedResult } from '../model/PagedResult';
import { Source } from '../model/Source';
import { Taxonomy } from '../model/Taxonomy';
import { Form } from '../model/Form';
import { Annotation } from '../model/Annotation';
import { Notification } from '../model/Notification';
import { Information } from '../model/Information';
import { Publication } from '../model/Publication';
import { Feedback } from '../model/Feedback';
import { News } from '../model/News';
import { Image } from '../model/Image';
import { AnnotationTag } from '../model/AnnotationTag';
import { Collection } from '../model/Collection';
import { Util } from './util.service';

export namespace LajiApi {

  export enum Endpoints {
    annotationsTags = 'annotations/tags',
    annotations = 'annotations',
    areas = 'areas',
    autocomplete = 'autocomplete',
    documentStats = 'documents/stats',
    checklists = 'checklists',
    collections = 'collections',
    feedback = 'feedback',
    forms = 'forms',
    htmlToPdf = 'html-to-pdf',
    information = 'information',
    news = 'news',
    notifications = 'notifications',
    publications = 'publications',
    sources = 'sources',
    taxon = 'taxa',
    images = 'images'
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

    export type AnnotationQuery = PersonToken;

    export interface AnnotationListQuery extends Paged, PersonToken {
      rootID: string;
    }

    export type AnnotationTagsQuery = LangWithFallback;

    export interface AreaQuery extends Lang, Paged {
      type?: LajiApi.AreaType;
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
      onlyInvasive?: boolean;
      excludeNameTypes?: string;
      formID?: string;
    }

    export interface ChecklistQuery extends Lang, Paged {
      idIn?: string;
    }

    export interface CollectionQuery extends Lang, Paged {
      idIn?: string;
    }

    export interface DocumentStatsQuery extends PersonToken {
      namedPlace: string;
    }

    export type FeedbackQuery = PersonToken;

    export interface FormsQuery extends Lang {
      format: 'json';
    }

    export interface FormsSchemaQuery extends Lang {
      format?: 'schema';
    }

    export interface FormsListQuery extends Lang, Paged { }

    export interface NotificationListQuery extends Paged, PersonToken {
      onlyUnSeen?: boolean;
    }

    export interface NewsQuery extends Lang, Paged {
      tag?: string;
    }

    export type NotificationQuery = PersonToken;

    export type InformationQuery = Lang;

    export type PublicationQuery = LangWithFallback;

    export interface SourceQuery extends LangWithFallback, Paged {
      idIn?: string;
    }

    export interface TaxaQuery extends LangWithFallback {
      maxLevel?: number;
      selectedFields?: string;
      informalGroupFilters?: string;
      adminStatusFilters?: string;
      redListStatusFilters?: string;
      typesOfOccurrenceFilters?: string;
      typesOfOccurrenceNotFilters?: string;
      invasiveSpeciesFilter?: boolean;
      includeHidden?: boolean;
      includeMedia?: boolean;
      includeDescriptions?: boolean;
      externalSources?: string;
      onlyFinnish?: boolean;
      sortOrder?: 'taxonomic'|'scientific_name'|'finnish_name';
    }

    export interface ImageQuery extends LangWithFallback, Paged {
      idIn?: string;
    }
  }

  export namespace Response {
    export interface DocumentStats {
      dateMedian: string;
    }

    export interface HtmlToPdf {
      base64pdf: string;
    }

    export type AnnotationTagListResponse = Array<AnnotationTag>;

    export type AnnotationListResponse = PagedResult<Annotation>;

    export type AreaListResponse = PagedResult<Area>;

    export type ChecklistListResponse = PagedResult<Checklist>;

    export type CollectionResponse = PagedResult<Collection>;

    export type NewsListResponse = PagedResult<News>;

    export type FormsListResponse = PagedResult<Form.List>;

    export type NotificationListResponse = PagedResult<Notification>;

    export type SourceListResponse = PagedResult<Source>;

    export type TaxonResponse = Taxonomy;

    export type ImageListResponse = PagedResult<Image>;
  }

}

@Injectable({providedIn: 'root'})
export class LajiApiService {

  constructor(private httpClient: HttpClient) { }

  getList(endpoint: LajiApi.Endpoints.annotationsTags, query: LajiApi.Query.AnnotationTagsQuery): Observable<LajiApi.Response.AnnotationTagListResponse>;
  getList(endpoint: LajiApi.Endpoints.annotations, query: LajiApi.Query.AnnotationListQuery): Observable<LajiApi.Response.AnnotationListResponse>;
  getList(endpoint: LajiApi.Endpoints.areas, query: LajiApi.Query.AreaQuery): Observable<LajiApi.Response.AreaListResponse>;
  getList(endpoint: LajiApi.Endpoints.checklists, query: LajiApi.Query.ChecklistQuery): Observable<LajiApi.Response.ChecklistListResponse>;
  getList(endpoint: LajiApi.Endpoints.collections, query: LajiApi.Query.CollectionQuery): Observable<LajiApi.Response.CollectionResponse>;
  getList(endpoint: LajiApi.Endpoints.documentStats, query: LajiApi.Query.DocumentStatsQuery): Observable<LajiApi.Response.DocumentStats>;
  getList(endpoint: LajiApi.Endpoints.forms, query: LajiApi.Query.FormsListQuery): Observable<LajiApi.Response.FormsListResponse>;
  getList(endpoint: LajiApi.Endpoints.information, query: LajiApi.Query.InformationQuery): Observable<Information>;
  getList(endpoint: LajiApi.Endpoints.news, query: LajiApi.Query.NewsQuery): Observable<LajiApi.Response.NewsListResponse>;
  getList(endpoint: LajiApi.Endpoints.notifications, query: LajiApi.Query.NotificationListQuery): Observable<LajiApi.Response.NotificationListResponse>;
  getList(endpoint: LajiApi.Endpoints.sources, query: LajiApi.Query.SourceQuery): Observable<LajiApi.Response.SourceListResponse>;
  getList(endpoint: LajiApi.Endpoints.images, query: LajiApi.Query.ImageQuery): Observable<LajiApi.Response.ImageListResponse>;
  getList<T>(endpoint: LajiApi.Endpoints, query: any = {}): Observable<T> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options = { params: {...Util.removeUndefinedFromObject(query)} };
    return this.httpClient.get<T>(url, options);
  }

  get(endpoint: LajiApi.Endpoints.autocomplete, id: LajiApi.AutocompleteField, query: LajiApi.Query.AutocompleteQuery): Observable<Autocomplete[]>;
  get(endpoint: LajiApi.Endpoints.forms, id: string, query: LajiApi.Query.FormsSchemaQuery): Observable<Form.SchemaForm>;
  get(endpoint: LajiApi.Endpoints.forms, id: string, query: LajiApi.Query.FormsQuery): Observable<any>;
  get(endpoint: LajiApi.Endpoints.information, id: string, query?: LajiApi.Query.InformationQuery): Observable<Information>;
  get(endpoint: LajiApi.Endpoints.news, id: string): Observable<News>;
  get(endpoint: LajiApi.Endpoints.publications, id: string, query: LajiApi.Query.PublicationQuery): Observable<Publication>;
  get(endpoint: LajiApi.Endpoints.taxon, id: string, query: LajiApi.Query.TaxaQuery): Observable<Taxonomy>;
  get<T>(endpoint: LajiApi.Endpoints, id: string, query: any = {}): Observable<T> {
    const url = `${environment.apiBase}/${endpoint}/${id}`;
    const options = { params: {...Util.removeUndefinedFromObject(query)} };
    return this.httpClient.get<T>(url, options);
  }

  post(endpoint: LajiApi.Endpoints.annotations, data: Annotation, query: LajiApi.Query.AnnotationQuery): Observable<Annotation>;
  post(endpoint: LajiApi.Endpoints.feedback, data: Feedback, query: LajiApi.Query.FeedbackQuery): Observable<void>;
  post(endpoint: LajiApi.Endpoints.htmlToPdf, data: any): Observable<Blob>;
  post(endpoint: LajiApi.Endpoints, data: any, query: any = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}`;
    const options: any = { params: {...Util.removeUndefinedFromObject(query)} };
    if (endpoint === LajiApi.Endpoints.htmlToPdf) {
      options['responseType'] = 'blob';
    }
    if (endpoint === LajiApi.Endpoints.annotations) {
      options['headers'] = 'x-beta';
    }
    return this.httpClient.post(
      url,
      data,
      options
    );
  }

  update(endpoint: LajiApi.Endpoints.notifications, data: Notification, query: LajiApi.Query.NotificationQuery): Observable<Notification>;
  update(endpoint: LajiApi.Endpoints, data: any, query: any = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}/${data.id}`;
    const options = { params: {...Util.removeUndefinedFromObject(query)} };
    return this.httpClient.put(
      url,
      data,
      options
    );
  }


  remove(endpoint: LajiApi.Endpoints.annotations, id: string, query: LajiApi.Query.AnnotationQuery): Observable<void>;
  remove(endpoint: LajiApi.Endpoints.notifications, id: string, query: LajiApi.Query.NotificationQuery): Observable<any>;
  remove(endpoint: LajiApi.Endpoints, id: string, query: any = {}): Observable<any> {
    const url = `${environment.apiBase}/${endpoint}/${id}`;
    const options = { params: {...Util.removeUndefinedFromObject(query)} };
    return this.httpClient.delete(
      url,
      options
    );
  }
}

/* tslint:disable:max-line-length no-empty-interface no-unused-interface */

import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_PATH } from './variables';
import { Configuration } from './configuration';
import {
  Annotation,
  AnnotationTag,
  Area,
  Autocomplete,
  Checklist,
  Document,
  Feedback,
  Form,
  FormSchema,
  HtmlToPdf,
  Image,
  Information, Metadata,
  News,
  Notification,
  PagedResult, Property,
  Publication,
  Source,
  Taxon
} from './models';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class LajiApiClient {

  protected basePath = 'https://api.laji.fi/v0';
  public configuration = new Configuration();

  constructor(
    private httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string,
    @Optional() configuration: Configuration
  ) {
    if (basePath) {
      this.basePath = basePath;
    }
    if (configuration) {
      this.configuration = configuration;
      this.basePath = basePath || configuration.basePath || this.basePath;
    }
  }

  getList(endpoint: LajiApiClient.Endpoints.autocomplete, query: LajiApiClient.AutocompleteParams): Observable<Autocomplete[]>;
  getList(endpoint: LajiApiClient.Endpoints.annotationsTags, query: LajiApiClient.AnnotationTagsFindParams): Observable<AnnotationTag>;
  getList(endpoint: LajiApiClient.Endpoints.annotations, query: LajiApiClient.AnnotationFindParams): Observable<PagedResult<Annotation>>;
  getList(endpoint: LajiApiClient.Endpoints.areas, query: LajiApiClient.AreaFindParams): Observable<PagedResult<Area>>;
  getList(endpoint: LajiApiClient.Endpoints.checklists, query: LajiApiClient.ChecklistFindParams): Observable<PagedResult<Checklist>>;
  getList(endpoint: LajiApiClient.Endpoints.documentStats, query: LajiApiClient.DocumentFindParams): Observable<PagedResult<Document>>;
  getList(endpoint: LajiApiClient.Endpoints.forms, query: LajiApiClient.FormFindAllParams): Observable<Form>;
  getList(endpoint: LajiApiClient.Endpoints.information, query: LajiApiClient.InformationParams): Observable<Information>;
  getList(endpoint: LajiApiClient.Endpoints.metadataClasses, query: LajiApiClient.MetadataParams): Observable<PagedResult<Metadata>>;
  getList(endpoint: LajiApiClient.Endpoints.metadataProperties, query: LajiApiClient.MetadataParams): Observable<PagedResult<Property>>;
  getList(endpoint: LajiApiClient.Endpoints.news, query: LajiApiClient.NewsFindAllParams): Observable<PagedResult<News>>;
  getList(endpoint: LajiApiClient.Endpoints.notifications, query: LajiApiClient.NotificationFindParams): Observable<PagedResult<Notification>>;
  getList(endpoint: LajiApiClient.Endpoints.sources, query: LajiApiClient.SourceFindParams): Observable<PagedResult<Source>>;
  getList(endpoint: LajiApiClient.Endpoints.images, query: LajiApiClient.ImageFindParams): Observable<PagedResult<Image>>;
  getList<T>(endpoint: LajiApiClient.Endpoints, query: object = {}): Observable<T> {
    const url = `${this.basePath}/${endpoint}`;
    const options = {params: {...this.removeUndefinedFromObject(query)}};
    return this.httpClient.get<T>(url, options);
  }

  get(endpoint: LajiApiClient.Endpoints.forms, id: string, query: LajiApiClient.FormSchemasParams): Observable<FormSchema>;
  get(endpoint: LajiApiClient.Endpoints.forms, id: string, query: LajiApiClient.FormParams): Observable<Form>;
  get(endpoint: LajiApiClient.Endpoints.information, id: string, query: LajiApiClient.InformationParams): Observable<Information>;
  get(endpoint: LajiApiClient.Endpoints.news, id: string): Observable<News>;
  get(endpoint: LajiApiClient.Endpoints.publications, id: string, query: LajiApiClient.PublicationFindByIdParams): Observable<Publication>;
  get(endpoint: LajiApiClient.Endpoints.taxon, id: string, query: LajiApiClient.TaxonFindParams): Observable<PagedResult<Taxon>>;
  get<T>(endpoint: LajiApiClient.Endpoints, id: string, query: object = {}): Observable<T> {
    const url = `${this.basePath}/${endpoint}/${id}`;
    const options = {params: {...this.removeUndefinedFromObject(query)}};
    return this.httpClient.get<T>(url, options);
  }

  post(endpoint: LajiApiClient.Endpoints.annotations, data: Annotation, query: LajiApiClient.AnnotationCreateParams): Observable<Annotation>;
  post(endpoint: LajiApiClient.Endpoints.feedback, data: Feedback, query: LajiApiClient.FeedbackSendParams): Observable<Feedback>;
  post(endpoint: LajiApiClient.Endpoints.htmlToPdf, data: any): Observable<HtmlToPdf>;
  post(endpoint: LajiApiClient.Endpoints, data: any, query: object = {}): Observable<any> {
    const url = `${this.basePath}/${endpoint}`;
    const options = {params: {...this.removeUndefinedFromObject(query)}};
    if (endpoint === LajiApiClient.Endpoints.htmlToPdf) {
      options['responseType'] = 'blob';
    }
    return this.httpClient.post(
      url,
      data,
      options
    );
  }

  update(endpoint: LajiApiClient.Endpoints.notifications, data: Notification, query: LajiApiClient.NotificationUpdateParams): Observable<Notification>;
  update(endpoint: LajiApiClient.Endpoints, data: any, query: object = {}): Observable<any> {
    const url = `${this.basePath}/${endpoint}/${data.id}`;
    const options = {params: {...this.removeUndefinedFromObject(query)}};
    return this.httpClient.put(
      url,
      data,
      options
    );
  }


  remove(endpoint: LajiApiClient.Endpoints.annotations, id: string, query: LajiApiClient.AnnotationDeleteParams): Observable<void>;
  remove(endpoint: LajiApiClient.Endpoints.notifications, id: string, query: LajiApiClient.NotificationDeleteParams): Observable<void>;
  remove(endpoint: LajiApiClient.Endpoints, id: string, query: object = {}): Observable<any> {
    const url = `${this.basePath}/${endpoint}/${id}`;
    const options = {params: {...this.removeUndefinedFromObject(query)}};
    return this.httpClient.delete(
      url,
      options
    );
  }

  private removeUndefinedFromObject(obj: object) {
    if (typeof obj !== 'object') {
      return obj;
    }
    if (!obj['access_token'] && this.configuration.accessToken) {
      obj['access_token'] = this.configuration.accessToken;
    }
    return Object.keys(obj).reduce((cumulative, current) => {
      if (typeof obj[current] !== 'undefined') {
        cumulative[current] = obj[current];
      }
      return cumulative;
    }, {});
  }
}

export namespace LajiApiClient {

  export type LangEnum = 'fi' | 'en' | 'sv';
  export type LangWithMultiEnum = LangEnum | 'multi';
  export const LangEnum = {
    fi: 'fi' as LangEnum,
    en: 'en' as LangEnum,
    sv: 'sv' as LangEnum,
    multi: 'multi' as LangWithMultiEnum,
  };

  export enum Endpoints {
    annotationsTags = 'annotations/tags',
    annotations = 'annotations',
    areas = 'areas',
    autocomplete = 'autocomplete',
    documentStats = 'documents/stats',
    checklists = 'checklists',
    feedback = 'feedback',
    forms = 'forms',
    htmlToPdf = 'html-to-pdf',
    information = 'information',
    metadataClasses = 'metadata/classes',
    metadataProperties = 'metadata/properties',
    news = 'news',
    notifications = 'notifications',
    publications = 'publications',
    sources = 'sources',
    taxon = 'taxa',
    images = 'images'
  }

  /**
   * Parameters for AnnotationCreateAnnotation
   */
  export interface AnnotationCreateParams {
    /**
     * Person's authentication token
     */
    personToken?: string;
  }

  /**
   * Parameters for AnnotationCreateAnnotation
   */
  export interface AnnotationDeleteParams {
    /**
     * Person's authentication token
     */
    personToken?: string;
  }

  /**
   * Parameters for AnnotationFindAnnotations
   */
  export interface AnnotationFindParams {

    /**
     * Filter by root ID
     */
    rootID: string;

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;
  }

  export interface AnnotationTagsFindParams {
    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for APIUserDeactivate
   */
  export interface APIUserDeleteParams {

    /**
     * person token of the person who is marked in charge
     */
    personToken: string;

    /**
     * Delete all the access tokens held by the user
     */
    all?: boolean;
  }

  /**
   * Parameters for AreaFindById
   */
  export interface AreaFindByIdParams {
    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  export interface MetadataParams {
    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  interface MetadataRanges {
    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    asLookupObject?: boolean;
  }

  export interface MetadataRangesParams extends MetadataRanges {
    asLookupObject?: false;
  }

  export interface MetadataRangesLookupParams extends MetadataRanges {
    asLookupObject: true;
  }

  /**
   * Parameters for AreaFind
   */
  export interface AreaFindParams {

    /**
     * Area type
     */
    type?: 'country' | 'biogeographicalProvince' | 'municipality' | 'oldMunicipality' | 'birdAssociationArea' | 'iucnEvaluationArea';

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with the given ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for AutocompleteFindByField
   */
  export interface AutocompleteParams {

    /**
     * Field to be used for autocomplete. This can also be any range found from metadata endpoint.
     */
    field: 'taxon' | 'collection' | 'friends' | 'unit' | 'person';

    /**
     * Search string
     */
    q?: string;

    /**
     * Friends only: Person token tells who's friends to look for
     */
    personToken?: string;

    /**
     * Taxon only: Filter to include only species (and subspecies)
     */
    onlySpecies?: boolean;

    /**
     * Taxon only: Filter to include only invasive species
     */
    onlyInvasive?: boolean;

    /**
     * Taxon only: Filter to include only finnish taxa
     */
    onlyFinnish?: boolean;

    /**
     * If observationMode is set, " sp." is catenated to higher taxa scientific name matches.
     */
    observationMode?: boolean;

    /**
     * Taxon only: Default: All match types; exact = exact matches, partial = partially matching, likely = fuzzy matching. Multiple values are separated by a comma (,).
     */
    matchType?: 'exact' | 'partial' | 'likely';

    /**
     * Unit only: Interpret the query as comma separated list instead of taxon name
     */
    list?: boolean;

    /**
     * Number of results
     */
    limit?: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Taxon only: Limit results to specified informal taxon group(s). Multiple values are separated by a comma (,).
     */
    informalTaxonGroup?: string;

    /**
     * Friends only: Ignore or include yourself to matches (defined by personToken)
     */
    includeSelf?: boolean;

    /**
     * Taxon only: Include additional taxon information
     */
    includePayload?: boolean;

    /**
     * Taxon only: Include the search string to the result list if no exact match was found
     */
    includeNonMatching?: boolean;

    /**
     * Unit only: Id of the form
     */
    formID?: string;

    /**
     * Taxon only: Exclude taxa from specified informal taxon group(s). Multiple values are separated by a comma (,).
     */
    excludedInformalTaxonGroup?: string;

    /**
     * Taxon only: Matching names have a type (for example MX.vernacularName, MX.hasMisappliedName); List name types you do not want included in the search. Multiple values are separated by a comma (,).
     */
    excludeNameTypes?: string;

    /**
     * Taxon only: Limit results to specified checklist (default is FinBIF master checklist)
     */
    checklist?: string;
  }

  /**
   * Parameters for ChecklistFindById
   */
  export interface ChecklistFindByIdParams {

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for ChecklistFind
   */
  export interface ChecklistFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for ChecklistVersionFindById
   */
  export interface ChecklistVersionFindByIdParams {

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for ChecklistVersionFind
   */
  export interface ChecklistVersionFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for CollectionFindChildren
   */
  export interface CollectionFindChildrenParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for CollectionFindById
   */
  export interface CollectionFindByIdParams {

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for CollectionFindRoots
   */
  export interface CollectionFindRootsParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for CollectionFind
   */
  export interface CollectionFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }


  /**
   * Parameters for CoordinateLocation
   */
  export interface CoordinateLocationParams {

    /**
     * Geometry object
     */
    geometry: {};

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for DocumentFindWithUser
   */
  export interface DocumentFindParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Fetch only templates
     */
    templates?: boolean;

    /**
     * Comma separated list of field names to include in the response
     */
    selectedFields?: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Limit the list of documents to a certain observation year (ignored when fetching templates)
     */
    observationYear?: string;

    /**
     * Limit the list of documents to a certain named place
     */
    namedPlace?: string;

    /**
     * Use this form's features for the request. Doesn   limit the limit of documents to this form ID!
     */
    formID?: string;

    /**
     * Limit the list of documents to a certain collection
     */
    collectionID?: string;
  }

  /**
   * Parameters for DocumentCreateWithUser
   */
  export interface DocumentCreateWithUserParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Format of validation error details
     */
    validationErrorFormat?: 'remote' | 'object' | 'jsonPath';

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for DocumentCountByType
   */
  export interface DocumentCountByTypeParams {

    /**
     * Count type
     */
    type: 'byYear';

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Limit the list of documents to a certain named place
     */
    namedPlace?: string;

    /**
     * Use this form's features for the request. Doesn   limit the limit of documents to this form ID!
     */
    formID?: string;

    /**
     * Limit the list of documents to a certain collection
     */
    collectionID?: string;
  }

  /**
   * Parameters for DocumentStats
   */
  export interface DocumentStatsParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Limit the list of documents to a certain named place
     */
    namedPlace: string;
  }

  /**
   * Parameters for DocumentFindByIdWithUser
   */
  export interface DocumentFindByIdParams {

    /**
     * Person's authentication token
     */
    personToken: string;
  }

  /**
   * Parameters for DocumentDeleteByIdWithUser
   */
  export interface DocumentDeleteParams {

    /**
     * Person's authentication token
     */
    personToken: string;
  }

  /**
   * Parameters for DocumentDocumentVersions
   */
  export interface DocumentDocumentVersionsParams {

    /**
     * Person's authentication token
     */
    personToken: string;
  }

  /**
   * Parameters for DocumentFetchDocumentVersion
   */
  export interface DocumentFetchDocumentVersionParams {

    /**
     * Version number
     */
    version: string;

    /**
     * Person's authentication token
     */
    personToken: string;
  }

  /**
   * Parameters for DocumentDiffDocumentVersion
   */
  export interface DocumentDiffDocumentVersionParams {

    /**
     * Version number
     */
    version: string;

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Compare to version number
     */
    diffTo: string;
  }

  /**
   * Parameters for DocumentValidateDocument
   */
  export interface DocumentValidateDocumentParams {

    /**
     * Name of the validator to run (default all specified in the form).
     */
    validator?: 'noExistingGatheringsInNamedPlace' | 'wbcNamedPlaceExists' | 'overlapWithNamedPlace' | 'uniqueNamedPlaceAlternativeIDs';

    /**
     * Format of validation error details
     */
    validationErrorFormat?: 'object' | 'jsonPath';

    /**
     * Run validators of this type
     */
    type?: 'error' | 'warning';

    /**
     * Person's authentication token
     */
    personToken?: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * ID of the form used for validation. If there is formID in the data that will be used instead.
     */
    formID?: string;

    /**
     * Json path of the field being validated (defaults to the whole document).
     */
    field?: string;
  }

  /**
   * Parameters for FeedbackSend
   */
  export interface FeedbackSendParams {

    /**
     * Authentication token of the person sending the feedback: If given, users email will be the reply address.
     */
    personToken?: string;
  }


  /**
   * Parameters for FormFindById
   */
  interface FormFindByIdParams {
    id: string;

    /**
     * Language of fields that have multiple languages. English is the default language.
     */
    lang?: LangEnum;

    /**
     * Response format
     */
    format?: 'json' | 'schema';
  }

  export interface FormParams extends FormFindByIdParams {
    format: 'json';
  }

  export interface FormSchemasParams extends FormFindByIdParams {
    format?: 'schema';
  }

  /**
   * Parameters for FormFindAll
   */
  export interface FormFindAllParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Language of fields that have multiple languages. English is the default language.
     */
    lang?: LangEnum;
  }

  /**
   * Parameters for FormPermissionFindByCollectionID
   */
  export interface FormPermissionFindByCollectionIDParams {

    /**
     * Users person token
     */
    personToken: string;

    /**
     * Collection id
     */
    collectionID: string;
  }

  /**
   * Parameters for FormPermissionRequestAccess
   */
  export interface FormPermissionRequestAccessParams {

    /**
     * Person token for the one who is requesting access
     */
    personToken: string;

    /**
     * Collection id
     */
    collectionID: string;
  }

  /**
   * Parameters for FormPermissionAcceptRequest
   */
  export interface FormPermissionAcceptRequestParams {

    /**
     * Person token who is authorised to accept requests
     */
    personToken: string;

    /**
     * Person id
     */
    personID: string;

    /**
     * Collection id
     */
    collectionID: string;

    /**
     * Access type
     */
    type?: 'admin' | 'editor';
  }

  /**
   * Parameters for FormPermissionRevokeAccess
   */
  export interface FormPermissionRevokeAccessParams {

    /**
     * Person token who is authorised to revoke access to form
     */
    personToken: string;

    /**
     * Person id
     */
    personID: string;

    /**
     * Collection id
     */
    collectionID: string;
  }


  /**
   * Parameters for ImageDeleteImage
   */
  export interface ImageDeleteImageParams {

    /**
     * Person token of the uploader.
     */
    personToken: string;

    /**
     * Id of the image
     */
    id: string;
  }

  /**
   * Parameters for ImageUpdateMeta
   */
  export interface ImageUpdateMetaParams {

    /**
     * Person token of the uploader.
     */
    personToken: string;

    /**
     * Id of the image
     */
    id: string;

  }

  /**
   * Parameters for ImageFindById
   */
  export interface ImageFindByIdParams {
    id: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for ImageUploadMeta
   */
  export interface ImageUploadMetaParams {

    /**
     * Temporary id of the image
     */
    tempId: string;

    /**
     * Person token of the uploader.
     */
    personToken: string;

  }

  /**
   * Parameters for ImageFind
   */
  export interface ImageFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  export interface InformationParams {
    lang: LangEnum;
  }


  /**
   * Parameters for InformalTaxonGroupGetWithSiblings
   */
  export interface InformalTaxonGroupGetWithSiblingsParams {
    id: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupGetParents
   */
  export interface InformalTaxonGroupGetParentsParams {
    id: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupGetParentLevel
   */
  export interface InformalTaxonGroupGetParentLevelParams {
    id: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupGetChildren
   */
  export interface InformalTaxonGroupGetChildrenParams {
    id: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupGetTree
   */
  export interface InformalTaxonGroupGetTreeParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupFindRoots
   */
  export interface InformalTaxonGroupFindRootsParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupFindById
   */
  export interface InformalTaxonGroupFindByIdParams {
    id: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for InformalTaxonGroupFind
   */
  export interface InformalTaxonGroupFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for LoggerStatus
   */
  export interface LoggerStatusParams {

    /**
     * How many minutes back to look for
     */
    minutesBack?: number;

    /**
     * Log event types to look for. Multiple values are separated by a comma (,).
     */
    level?: 'info' | 'warn' | 'error';
  }

  /**
   * Parameters for MetadataFindClass
   */
  export interface MetadataFindClassParams {
    class: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for MetadataFindClassProperties
   */
  export interface MetadataFindClassPropertiesParams {
    class: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for MetadataFindClassRanges
   */
  export interface MetadataFindClassRangesParams {
    class: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Get all range values as a lookup object instead of array of properties
     */
    asLookupObject?: boolean;
  }

  /**
   * Parameters for MetadataFindProperty
   */
  export interface MetadataFindPropertyParams {
    property: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for MetadataFindPropertiesRanges
   */
  export interface MetadataFindPropertiesRangesParams {
    property: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * If the range is a class, give list of class instances (limited support of class types)
     */
    classTypeAsList?: boolean;

    /**
     * Get ranges as a lookup object instead of array of objects
     */
    asLookupObject?: boolean;
  }

  /**
   * Parameters for MetadataFindAllRanges
   */
  export interface MetadataFindAllRangesParams {

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Get all range values as a lookup object instead of array of properties
     */
    asLookupObject?: boolean;
  }

  /**
   * Parameters for MetadataFindRange
   */
  export interface MetadataFindRangeParams {
    range: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Get all values as a lookup object instead of array of objects
     */
    asLookupObject?: boolean;
  }

  /**
   * Parameters for NamedPlaceFindNamedPlaces
   */
  export interface NamedPlaceFindNamedPlacesParams {

    /**
     * Filter by taxon ID
     */
    taxonIDs?: string;

    /**
     * Filter by tags. Multiple values are separated by a comma (,).
     */
    tags?: string;

    /**
     * Comma separated list of field names to include in the response
     */
    selectedFields?: string;

    /**
     * Person's authentication token
     */
    personToken?: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Filter by municipality ID
     */
    municipality?: string;

    /**
     * Include units in prepopulated and accepted documents (only with collectionID HR.2049)
     */
    includeUnits?: boolean;

    /**
     * Include public named places (used only when personToken is given)
     */
    includePublic?: boolean;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;

    /**
     * Filter by collection ID
     */
    collectionID?: string;

    /**
     * Filter by bird association area ID
     */
    birdAssociationArea?: string;

    /**
     * Filter by alternative ID
     */
    alternativeIDs?: string;
  }

  /**
   * Parameters for NamedPlaceCreateWithUser
   */
  export interface NamedPlaceCreateWithUserParams {

    /**
     * Person's authentication token
     */
    personToken: string;

  }

  /**
   * Parameters for NamedPlaceFindNamedPlaceById
   */
  export interface NamedPlaceFindNamedPlaceByIdParams {

    /**
     * Id for the place
     */
    id: string;

    /**
     * Person's authentication token
     */
    personToken?: string;

    /**
     * Include units in prepopulated and accepted documents (only with collectionID HR.2049)
     */
    includeUnits?: boolean;
  }

  /**
   * Parameters for NamedPlaceUpdateNamedPlace
   */
  export interface NamedPlaceUpdateNamedPlaceParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Id for the place
     */
    id: string;

  }

  /**
   * Parameters for NamedPlaceReserveNamedPlace
   */
  export interface NamedPlaceReserveParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Id for the place
     */
    id: string;

    /**
     * The date when the reservation expires
     */
    until?: string;

    /**
     * Id for the person (your own id will be used if you are not admin)
     */
    personID?: string;
  }

  /**
   * Parameters for NamedPlaceDeleteNamedPlaceReservations
   */
  export interface NamedPlaceResereDeleteParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Id for the place
     */
    id: string;
  }

  /**
   * Parameters for NewsFindAll
   */
  export interface NewsFindAllParams {

    /**
     * Show only news with the given tag(s). Multiple values are separated by a comma (,).
     */
    tag?: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Language of fields that have multiple languages. English is the default language.
     */
    lang?: LangEnum;
  }

  /**
   * Parameters for NotificationFindByPersonToken
   */
  export interface NotificationFindParams {

    /**
     * Person's authentication token
     */
    personToken: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Return only notifications that have not been marked as seen.
     */
    onlyUnSeen?: boolean;
  }

  /**
   * Parameters for NotificationUpdateNotification
   */
  export interface NotificationUpdateParams {

    /**
     * Person's authentication token (must be the owner of the notification)
     */
    personToken: string;

  }

  /**
   * Parameters for NotificationDeleteNotificationByPerson
   */
  export interface NotificationDeleteParams {

    /**
     * Person's authentication token (must be the owner of the notification)
     */
    personToken: string;

    /**
     * Notification id
     */
    notificationID: string;
  }

  /**
   * Parameters for PersonRemoveFriend
   */
  export interface PersonRemoveFriendParams {

    /**
     * Accept this user as a friend
     */
    userId: string;

    /**
     * Person token
     */
    personToken: string;

    /**
     * Should the removed friend should be blocked also
     */
    block?: boolean;
  }

  /**
   * Parameters for PersonAcceptFriendRequest
   */
  export interface PersonAcceptFriendRequestParams {

    /**
     * Accept this user as a friend
     */
    userId: string;

    /**
     * Person personToken
     */
    personToken: string;
  }

  /**
   * Parameters for PersonAddFriendRequest
   */
  export interface PersonAddFriendRequestParams {

    /**
     * profile key
     */
    profileKey: string;

    /**
     * Person token
     */
    personToken: string;
  }

  /**
   * Parameters for PersonUpdateProfileByToken
   */
  export interface ProfileUpdateParams {
    personToken: string;
  }

  /**
   * Parameters for PersonCreateProfileByToken
   */
  export interface ProfileCreateParams {
    personToken: string;
  }

  /**
   * Parameters for PublicationFindById
   */
  export interface PublicationFindByIdParams {

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for PublicationFind
   */
  export interface PublicationFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for RedListEvaluationGroupGetWithSiblings
   */
  export interface RedListEvaluationSiblingsParams {
    id: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupGetParents
   */
  export interface RedListEvaluationParentsParams {
    id: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupGetParentLevel
   */
  export interface RedListEvaluationParentLevelParams {
    id: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupGetChildren
   */
  export interface RedListEvaluationChildrenParams {
    id: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupGetTree
   */
  export interface RedListEvaluationTreeParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupFindRoots
   */
  export interface RedListEvaluationRootsParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupFindById
   */
  export interface RedListEvaluationFindByIdParams {

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for RedListEvaluationGroupFind
   */
  export interface RedListEvaluationFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for SourceFindById
   */
  export interface SourceFindByIdParams {
    id: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;
  }

  /**
   * Parameters for SourceFind
   */
  export interface SourceFindParams {

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Include only items with these ids. Multiple values are separated by a comma (,).
     */
    idIn?: string;
  }

  /**
   * Parameters for TaxonSearch
   */
  export interface TaxonSearchParams {

    /**
     * Name to search
     */
    query: string;

    /**
     * Filter to include only species (and subspecies)
     */
    onlySpecies?: boolean;

    /**
     * Filter to include only invasive species
     */
    onlyInvasive?: boolean;

    /**
     * Filter to include only finnish taxa
     */
    onlyFinnish?: boolean;

    /**
     * If observationMode is set, " sp." is catenated to higher taxa scientific name matches.
     */
    observationMode?: boolean;

    /**
     * Default: All match types; exact = exact matches, partial = partially matching, likely = fuzzy matching. Multiple values are separated by a comma (,).
     */
    matchType?: 'exact' | 'partial' | 'likely';

    /**
     * Limit the pageSize of results
     */
    limit?: string;

    /**
     * Search taxa from specified informal taxon group(s). Multiple values are separated by a comma (,).
     */
    informalTaxonGroup?: string;

    /**
     * Exclude taxa from specified informal taxon group(s)Multiple values are separated by a comma (,).
     */
    excludedInformalTaxonGroup?: string;

    /**
     * Matching names have a type (for example MX.vernacularName, MX.hasMisappliedName); List name types you do not want included in the search. Multiple values are separated by a comma (,).
     */
    excludeNameTypes?: string;

    /**
     * Search taxon from specified checklist (defaults to FinBIF master checklist)
     */
    checklist?: string;
  }

  /**
   * Parameters for TaxonFindBySubject
   */
  export interface TaxonFindByIdParams {

    /**
     * Will not include these type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceNotFilters?: string;

    /**
     * Filter based on type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceFilters?: string;

    /**
     * Order of the species: taxonomic|scientific_name|finnish_name
     */
    sortOrder?: string;

    /**
     * Select fields to include in the result. Multiple values are separated by a comma (,).
     */
    selectedFields?: string;

    /**
     * Filter based on the latest red list statu(es). Multiple values are separated by a comma (,).
     */
    redListStatusFilters?: string;

    /**
     * Filter based on IUCN red list taxon group(s). Multiple values are separated by a comma (,).
     */
    redListEvaluationGroups?: string;

    /**
     * Will include only finnish species
     */
    onlyFinnish?: boolean;

    /**
     * How many levels of children to show
     */
    maxLevel?: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * True: Will include only invasive species. False: Will exclude invasive species.
     */
    invasiveSpeciesFilter?: boolean;

    /**
     * Filter based on given informal group(s). Multiple values are separated by a comma (,).
     */
    informalGroupFilters?: string;

    /**
     * Include red list evaluations in the response.
     */
    includeRedListEvaluations?: boolean;

    /**
     * Include media objects in the response
     */
    includeMedia?: boolean;

    /**
     * True: Will show hidden taxa, False: Hidden taxa are skipped and their non-hidden children raised up in the tree.
     */
    includeHidden?: boolean;

    /**
     * Include description objects in the response.
     */
    includeDescriptions?: boolean;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;

    /**
     * Filter based on administrative status(es). Multiple values are separated by a comma (,).
     */
    adminStatusFilters?: string;
  }

  /**
   * Parameters for TaxonAllSpecies
   */
  export interface TaxonAllSpeciesParams {

    /**
     * Will not include these type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceNotFilters?: string;

    /**
     * Filter based on type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceFilters?: string;

    /**
     * Filter based on taxon rank(s). Multiple values are separated by a comma (,).
     */
    taxonRanks?: string;

    /**
     * Order of the species: taxonomic|scientific_name|finnish_name
     */
    sortOrder?: string;

    /**
     * Select fields to include in the result. Multiple values are separated by a comma (,).
     */
    selectedFields?: string;

    /**
     * Filter based on the latest red list statu(es). Multiple values are separated by a comma (,).
     */
    redListStatusFilters?: string;

    /**
     * Filter based on IUCN red list taxon group(s). Multiple values are separated by a comma (,).
     */
    redListEvaluationGroups?: string;

    /**
     * Filter based on taxon primary habitat
     */
    primaryHabitat?: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Will include only finnish species
     */
    onlyFinnish?: boolean;

    /**
     * Filter based on taxon threats
     */
    latestRedListEvaluationThreats?: string;

    /**
     * Filter based on the latest red list evaluation statu(es)
     */
    latestRedListEvaluationRedListStatus?: string;

    /**
     * Filter based on taxon primary threat
     */
    latestRedListEvaluationPrimaryThreat?: string;

    /**
     * Filter based on taxon primary habitat
     */
    latestRedListEvaluationPrimaryHabitat?: string;

    /**
     * Filter based on taxon primary endangerment reason
     */
    latestRedListEvaluationPrimaryEndangermentReason?: string;

    /**
     * Filter based on taxon endangerment reasons
     */
    latestRedListEvaluationEndangermentReasons?: string;

    /**
     * Filter based on taxon any habitat
     */
    latestRedListEvaluationAnyHabitat?: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Filter based on invasive species main group(s). Multiple values are separated by a comma (,).
     */
    invasiveSpeciesMainGroups?: string;

    /**
     * True: Will include only invasive species. False: Will exclude invasive species.
     */
    invasiveSpeciesFilter?: boolean;

    /**
     * Filter based on given informal group(s). Multiple values are separated by a comma (,).
     */
    informalGroupFilters?: string;

    /**
     * Include red list evaluations in the response.
     */
    includeRedListEvaluations?: boolean;

    /**
     * Include media objects in the response
     */
    includeMedia?: boolean;

    /**
     * True: Will show hidden taxa, False: Hidden taxa are skipped and their non-hidden children raised up in the tree.
     */
    includeHidden?: boolean;

    /**
     * Include description objects in the response.
     */
    includeDescriptions?: boolean;

    /**
     * Include only species that have media objects attached
     */
    hasMediaFilter?: boolean;

    /**
     * When true will only include taxa which have latest red list evaluation and when false will list those species that don't have the evaluation
     */
    hasLatestRedListEvaluation?: string;

    /**
     * Include only species that have description objects attached
     */
    hasDescriptionFilter?: boolean;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;

    /**
     * Search taxon from specified checklist (defaults to FinBIF master checklist)
     */
    checklist?: string;

    /**
     * Filter based on taxon any habitat
     */
    anyHabitat?: string;

    /**
     * Aggregate response size
     */
    aggregateSize?: string;

    /**
     * Aggregate order by for the response. Multiple values are separated by a comma (,). (NOT IN USE)
     */
    aggregateOrderBy?: string;

    /**
     * Aggregate by these fields. Multiple values are separated by a comma (,). Different aggregations can be made at the same time using semicolon as separator (;) and aggregates can be named giving "=name" at the end of each aggregation.
     *
     * Result will have aggregations property object where the keys of the object are either the field(s) that were used or the name if it was given.
     */
    aggregateBy?: string;

    /**
     * Filter based on administrative status(es). Multiple values are separated by a comma (,).
     */
    adminStatusFilters?: string;
  }

  /**
   * Parameters for TaxonFindSpecies
   */
  export interface TaxonFindSpeciesParams {

    /**
     * Id of the taxon
     */
    id: string;

    /**
     * Will not include these type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceNotFilters?: string;

    /**
     * Filter based on type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceFilters?: string;

    /**
     * Filter based on taxon rank(s). Multiple values are separated by a comma (,).
     */
    taxonRanks?: string;

    /**
     * Order of the species: taxonomic|scientific_name|finnish_name
     */
    sortOrder?: string;

    /**
     * Select fields to include in the result. Multiple values are separated by a comma (,).
     */
    selectedFields?: string;

    /**
     * Filter based on the latest red list statu(es). Multiple values are separated by a comma (,).
     */
    redListStatusFilters?: string;

    /**
     * Filter based on IUCN red list taxon group(s). Multiple values are separated by a comma (,).
     */
    redListEvaluationGroups?: string;

    /**
     * Filter based on taxon primary habitat
     */
    primaryHabitat?: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Will include only finnish species
     */
    onlyFinnish?: boolean;

    /**
     * Filter based on taxon threats
     */
    latestRedListEvaluationThreats?: string;

    /**
     * Filter based on the latest red list evaluation statu(es)
     */
    latestRedListEvaluationRedListStatus?: string;

    /**
     * Filter based on taxon primary threat
     */
    latestRedListEvaluationPrimaryThreat?: string;

    /**
     * Filter based on taxon primary habitat
     */
    latestRedListEvaluationPrimaryHabitat?: string;

    /**
     * Filter based on taxon primary endangerment reason
     */
    latestRedListEvaluationPrimaryEndangermentReason?: string;

    /**
     * Filter based on taxon endangerment reasons
     */
    latestRedListEvaluationEndangermentReasons?: string;

    /**
     * Filter based on taxon any habitat
     */
    latestRedListEvaluationAnyHabitat?: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Filter based on invasive species main group(s). Multiple values are separated by a comma (,).
     */
    invasiveSpeciesMainGroups?: string;

    /**
     * True: Will include only invasive species. False: Will exclude invasive species.
     */
    invasiveSpeciesFilter?: boolean;

    /**
     * Filter based on given informal group(s). Multiple values are separated by a comma (,).
     */
    informalGroupFilters?: string;

    /**
     * Include red list evaluations in the response.
     */
    includeRedListEvaluations?: boolean;

    /**
     * Include media objects in the response
     */
    includeMedia?: boolean;

    /**
     * True: Will show hidden taxa, False: Hidden taxa are skipped and their non-hidden children raised up in the tree.
     */
    includeHidden?: boolean;

    /**
     * Include description objects in the response.
     */
    includeDescriptions?: boolean;

    /**
     * Include only species that have media objects attached
     */
    hasMediaFilter?: boolean;

    /**
     * When true will only include taxa which have latest red list evaluation and when false will list those species that don't have the evaluation
     */
    hasLatestRedListEvaluation?: string;

    /**
     * Include only species that have description objects attached
     */
    hasDescriptionFilter?: boolean;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;

    /**
     * Search taxon from specified checklist (defaults to FinBIF master checklist)
     */
    checklist?: string;

    /**
     * Filter based on taxon any habitat
     */
    anyHabitat?: string;

    /**
     * Aggregate response size
     */
    aggregateSize?: string;

    /**
     * Aggregate order by for the response. Multiple values are separated by a comma (,). (NOT IN USE)
     */
    aggregateOrderBy?: string;

    /**
     * Aggregate by these fields. Multiple values are separated by a comma (,). Different aggregations can be made at the same time using semicolon as separator (;) and aggregates can be named giving "=name" at the end of each aggregation.
     *
     * Result will have aggregations property object where the keys of the object are either the field(s) that were used or the name if it was given.
     */
    aggregateBy?: string;

    /**
     * Filter based on administrative status(es). Multiple values are separated by a comma (,).
     */
    adminStatusFilters?: string;
  }

  /**
   * Parameters for TaxonFindTaxa
   */
  export interface TaxonFindParams {

    /**
     * Will not include these type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceNotFilters?: string;

    /**
     * Filter based on type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceFilters?: string;

    /**
     * Filter based on taxon rank(s). Multiple values are separated by a comma (,).
     */
    taxonRanks?: string;

    /**
     * Show only taxa that have been marked as species
     */
    species?: boolean;

    /**
     * Order of the species: taxonomic|scientific_name|finnish_name
     */
    sortOrder?: string;

    /**
     * Select fields to include in the result. Multiple values are separated by a comma (,).
     */
    selectedFields?: string;

    /**
     * Filter based on the latest red list statu(es). Multiple values are separated by a comma (,).
     */
    redListStatusFilters?: string;

    /**
     * Filter based on IUCN red list taxon group(s). Multiple values are separated by a comma (,).
     */
    redListEvaluationGroups?: string;

    /**
     * Filter based on taxon primary habitat
     */
    primaryHabitat?: string;

    /**
     * Page size
     */
    pageSize?: number;

    /**
     * Page number
     */
    page?: number;

    /**
     * Will include only finnish species
     */
    onlyFinnish?: boolean;

    /**
     * Filter based on taxon threats
     */
    latestRedListEvaluationThreats?: string;

    /**
     * Filter based on the latest red list evaluation statu(es)
     */
    latestRedListEvaluationRedListStatus?: string;

    /**
     * Filter based on taxon primary threat
     */
    latestRedListEvaluationPrimaryThreat?: string;

    /**
     * Filter based on taxon primary habitat
     */
    latestRedListEvaluationPrimaryHabitat?: string;

    /**
     * Filter based on taxon primary endangerment reason
     */
    latestRedListEvaluationPrimaryEndangermentReason?: string;

    /**
     * Filter based on taxon endangerment reasons
     */
    latestRedListEvaluationEndangermentReasons?: string;

    /**
     * Filter based on taxon any habitat
     */
    latestRedListEvaluationAnyHabitat?: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Filter based on invasive species main group(s). Multiple values are separated by a comma (,).
     */
    invasiveSpeciesMainGroups?: string;

    /**
     * True: Will include only invasive species. False: Will exclude invasive species.
     */
    invasiveSpeciesFilter?: boolean;

    /**
     * Filter based on given informal group(s). Multiple values are separated by a comma (,).
     */
    informalGroupFilters?: string;

    /**
     * Include red list evaluations in the response.
     */
    includeRedListEvaluations?: boolean;

    /**
     * Include media objects in the response
     */
    includeMedia?: boolean;

    /**
     * True: Will show hidden taxa, False: Hidden taxa are skipped and their non-hidden children raised up in the tree.
     */
    includeHidden?: boolean;

    /**
     * Include description objects in the response.
     */
    includeDescriptions?: boolean;

    /**
     * Include only species that have media objects attached
     */
    hasMediaFilter?: boolean;

    /**
     * When true will only include taxa which have latest red list evaluation and when false will list those species that don't have the evaluation
     */
    hasLatestRedListEvaluation?: string;

    /**
     * Include only species that have description objects attached
     */
    hasDescriptionFilter?: boolean;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;

    /**
     * Search taxon from specified checklist (defaults to FinBIF master checklist)
     */
    checklist?: string;

    /**
     * Filter based on taxon any habitat
     */
    anyHabitat?: string;

    /**
     * Aggregate response size
     */
    aggregateSize?: string;

    /**
     * Aggregate order by for the response. Multiple values are separated by a comma (,). (NOT IN USE)
     */
    aggregateOrderBy?: string;

    /**
     * Aggregate by these fields. Multiple values are separated by a comma (,). Different aggregations can be made at the same time using semicolon as separator (;) and aggregates can be named giving "=name" at the end of each aggregation.
     *
     * Result will have aggregations property object where the keys of the object are either the field(s) that were used or the name if it was given.
     */
    aggregateBy?: string;

    /**
     * Filter based on administrative status(es). Multiple values are separated by a comma (,).
     */
    adminStatusFilters?: string;
  }

  /**
   * Parameters for TaxonFindChildren
   */
  export interface TaxonFindChildrenParams {

    /**
     * Id of the taxon
     */
    id: string;

    /**
     * Will not include these type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceNotFilters?: string;

    /**
     * Filter based on type(s) of occurrence. Multiple values are separated by a comma (,).
     */
    typesOfOccurrenceFilters?: string;

    /**
     * Order of the species: taxonomic|scientific_name|finnish_name
     */
    sortOrder?: string;

    /**
     * Select fields to include in the result. Multiple values are separated by a comma (,).
     */
    selectedFields?: string;

    /**
     * Filter based on the latest red list statu(es). Multiple values are separated by a comma (,).
     */
    redListStatusFilters?: string;

    /**
     * Filter based on IUCN red list taxon group(s). Multiple values are separated by a comma (,).
     */
    redListEvaluationGroups?: string;

    /**
     * Will include only finnish species
     */
    onlyFinnish?: boolean;

    /**
     * How many levels of children to show
     */
    maxLevel?: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * True: Will include only invasive species. False: Will exclude invasive species.
     */
    invasiveSpeciesFilter?: boolean;

    /**
     * Filter based on given informal group(s). Multiple values are separated by a comma (,).
     */
    informalGroupFilters?: string;

    /**
     * Include red list evaluations in the response.
     */
    includeRedListEvaluations?: boolean;

    /**
     * Include media objects in the response
     */
    includeMedia?: boolean;

    /**
     * True: Will show hidden taxa, False: Hidden taxa are skipped and their non-hidden children raised up in the tree.
     */
    includeHidden?: boolean;

    /**
     * Include description objects in the response.
     */
    includeDescriptions?: boolean;

    /**
     * Include only species that have media objects attached
     */
    hasMediaFilter?: boolean;

    /**
     * Include only species that have description objects attached
     */
    hasDescriptionFilter?: boolean;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;

    /**
     * Filter based on administrative status(es). Multiple values are separated by a comma (,).
     */
    adminStatusFilters?: string;
  }

  /**
   * Parameters for TaxonFindMedia
   */
  export interface TaxonFindMediaParams {

    /**
     * Id of the taxon
     */
    id: string;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;
  }

  /**
   * Parameters for TaxonFindDescriptions
   */
  export interface TaxonFindDescriptionsParams {

    /**
     * Id of the taxon
     */
    id: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;
  }

  /**
   * Parameters for TaxonFindParents
   */
  export interface TaxonFindParentsParams {

    /**
     * Id of the taxon
     */
    id: string;

    /**
     * Select fields to include in the result. Multiple values are separated by a comma (,).
     */
    selectedFields?: string;

    /**
     * Enable or disable language fall back (ignored when multi lang selected).
     */
    langFallback?: boolean;

    /**
     * Language of fields that have multiple languages. If multi is selected fields that can have multiple languages will contain language objects
     */
    lang?: LangWithMultiEnum;

    /**
     * Checklist version to be used. Defaults to latest version
     */
    checklistVersion?: string;
  }

  /**
   * Parameters for postWarehousePush
   */
  export interface PostWarehousePushParams {

    /**
     * See [documentation](https://laji.fi/about/1402) for complete reference. Can contain multiple documents.
     */
    documents: Document | Document[];

    /**
     * Normally sourceId is received via the API key. By giving this parameter you can override the sourceId. API key must have permissions to use that sourceId.
     */
    sourceId?: string;
  }

  /**
   * Parameters for deleteWarehousePush
   */
  export interface DeleteWarehousePushParams {

    /**
     * Document URI to be deleted.
     */
    documentId: string;

    /**
     * Normally sourceId is received via the API key. By giving this parameter you can override the sourceId. API key must have permissions to use that sourceId.
     */
    sourceId?: string;
  }

  /**
   * Parameters for getWarehouseQueryCount
   */
  export interface GetWarehouseQueryCountParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'plain';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'text/plain';
  }

  /**
   * Parameters for getWarehouseQueryList
   */
  export interface GetWarehouseQueryListParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Define what fields to include to the result. Defaults to [document.collectionId, document.documentId, document.licenseId, document.secureLevel, document.secureReasons, document.sourceId, gathering.conversions.wgs84CenterPoint.lat, gathering.conversions.wgs84CenterPoint.lon, gathering.displayDateTime, gathering.gatheringId, gathering.interpretations.coordinateAccuracy, gathering.interpretations.municipalityDisplayname, gathering.interpretations.sourceOfCoordinates, gathering.locality, gathering.team, unit.abundanceString, unit.linkings.taxon.id, unit.linkings.taxon.scientificName, unit.linkings.taxon.vernacularName, unit.notes, unit.recordBasis, unit.taxonVerbatim, unit.unitId] Multiple values are seperated by ','.
     */
    selected?: Array<'document.annotations.annotationByPerson' | 'document.annotations.annotationByPersonName' | 'document.annotations.annotationBySystem' | 'document.annotations.annotationBySystemName' | 'document.annotations.annotationClass' | 'document.annotations.created' | 'document.annotations.id' | 'document.annotations.invasiveControlEffectiveness' | 'document.annotations.notes' | 'document.annotations.opinion' | 'document.annotations.rootID' | 'document.annotations.targetID' | 'document.annotations.type' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors.fullName' | 'document.linkings.editors.id' | 'document.linkings.editors.userId' | 'document.loadDate' | 'document.media.author' | 'document.media.caption' | 'document.media.copyrightOwner' | 'document.media.fullURL' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.media.squareThumbnailURL' | 'document.media.thumbnailURL' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlaceId' | 'document.notes' | 'document.partial' | 'document.quality.issue.issue' | 'document.quality.issue.message' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.biogeographicalProvinces' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipalities' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers.fullName' | 'gathering.linkings.observers.id' | 'gathering.linkings.observers.userId' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.caption' | 'gathering.media.copyrightOwner' | 'gathering.media.fullURL' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.media.squareThumbnailURL' | 'gathering.media.thumbnailURL' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.notes' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.message' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.message' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.message' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.notes' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.checklist' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameAuthorship' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.vernacularName' | 'unit.linkings.taxon.checklist' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameAuthorship' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.vernacularName' | 'unit.media.author' | 'unit.media.caption' | 'unit.media.copyrightOwner' | 'unit.media.fullURL' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.media.squareThumbnailURL' | 'unit.media.thumbnailURL' | 'unit.mediaCount' | 'unit.notes' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.message' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.message' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.reportedTaxonId' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.notes' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to [gathering.eventDate.begin DESC, document.loadDate DESC, unit.taxonVerbatim ASC]. Unit key is always added as a last parameter to ensure correct paging. You can include ASC or DESC after the name of the field (defaults to ASC).Multiple values are seperated by ','.
     */
    orderBy?: Array<'RANDOM' | 'RANDOM:seed' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.firstLoadDate' | 'document.loadDate' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.name' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.locality' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.team' | 'unit.abundanceString' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedTaxonConfidence' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'dwc_xml';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/dwc+xml';
  }

  /**
   * Parameters for getWarehouseQueryAggregate
   */
  export interface GetWarehouseQueryAggregateParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Value of this parameter affects how oldestRecord and newestRecord are calculated regarding observations reported as date span. False (default): oldest=min(date.begin), newest=max(date.end). True: oldest=min(date.end), newest=max(date.begin).
     */
    pessimisticDateRangeHandling?: boolean;

    /**
     * Include pair count sum and max.
     */
    pairCounts?: boolean;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to count (desc) and each aggregate by field (asc). Each fieldname given as parameter defaults to ASC - if you want to sort using descending order, add " DESC" to the end of the field name. In addition to aggregateBy fields you can use the following aggregate function names: [count, individualCountSum, individualCountMax, oldestRecord, newestRecord, pairCountMax, pairCountSum, firstLoadDateMin, firstLoadDateMax]. Multiple values are seperated by ','.
     */
    orderBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.copyrightOwner' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'gathering.team.memberId' | 'gathering.team.memberName' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.administrativeStatuses' | 'unit.linkings.originalTaxon.aggregateId' | 'unit.linkings.originalTaxon.anamorphId' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.birdlifeCode' | 'unit.linkings.originalTaxon.classId' | 'unit.linkings.originalTaxon.cultivarId' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.divisionId' | 'unit.linkings.originalTaxon.domainId' | 'unit.linkings.originalTaxon.ecotypeId' | 'unit.linkings.originalTaxon.euringCode' | 'unit.linkings.originalTaxon.euringNumber' | 'unit.linkings.originalTaxon.familyId' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.formId' | 'unit.linkings.originalTaxon.genusId' | 'unit.linkings.originalTaxon.groupId' | 'unit.linkings.originalTaxon.habitats' | 'unit.linkings.originalTaxon.hybridId' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.infraclassId' | 'unit.linkings.originalTaxon.infradivisionId' | 'unit.linkings.originalTaxon.infragenericHybridId' | 'unit.linkings.originalTaxon.infragenericTaxonId' | 'unit.linkings.originalTaxon.infrakingdomId' | 'unit.linkings.originalTaxon.infraorderId' | 'unit.linkings.originalTaxon.infraphylumId' | 'unit.linkings.originalTaxon.infraspecificTaxonId' | 'unit.linkings.originalTaxon.intergenericHybridId' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.kingdomId' | 'unit.linkings.originalTaxon.nameAccordingTo' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.nothogenusId' | 'unit.linkings.originalTaxon.nothospeciesId' | 'unit.linkings.originalTaxon.nothosubspeciesId' | 'unit.linkings.originalTaxon.orderId' | 'unit.linkings.originalTaxon.parentId' | 'unit.linkings.originalTaxon.parvclassId' | 'unit.linkings.originalTaxon.parvorderId' | 'unit.linkings.originalTaxon.phylumId' | 'unit.linkings.originalTaxon.populationGroupId' | 'unit.linkings.originalTaxon.primaryHabitat' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.sectionId' | 'unit.linkings.originalTaxon.seriesId' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesAggregateId' | 'unit.linkings.originalTaxon.speciesId' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.speciesTaxonomicOrder' | 'unit.linkings.originalTaxon.subclassId' | 'unit.linkings.originalTaxon.subdivisionId' | 'unit.linkings.originalTaxon.subfamilyId' | 'unit.linkings.originalTaxon.subformId' | 'unit.linkings.originalTaxon.subgenusId' | 'unit.linkings.originalTaxon.subkingdomId' | 'unit.linkings.originalTaxon.suborderId' | 'unit.linkings.originalTaxon.subphylumId' | 'unit.linkings.originalTaxon.subsectionId' | 'unit.linkings.originalTaxon.subseriesId' | 'unit.linkings.originalTaxon.subspeciesId' | 'unit.linkings.originalTaxon.subspecificAggregateId' | 'unit.linkings.originalTaxon.subtribeId' | 'unit.linkings.originalTaxon.subvarietyId' | 'unit.linkings.originalTaxon.superclassId' | 'unit.linkings.originalTaxon.superdivisionId' | 'unit.linkings.originalTaxon.superdomainId' | 'unit.linkings.originalTaxon.superfamilyId' | 'unit.linkings.originalTaxon.supergenusId' | 'unit.linkings.originalTaxon.superorderId' | 'unit.linkings.originalTaxon.superphylumId' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.originalTaxon.tribeId' | 'unit.linkings.originalTaxon.typesOfOccurrenceInFinland' | 'unit.linkings.originalTaxon.varietyId' | 'unit.linkings.taxon.administrativeStatuses' | 'unit.linkings.taxon.aggregateId' | 'unit.linkings.taxon.anamorphId' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.birdlifeCode' | 'unit.linkings.taxon.classId' | 'unit.linkings.taxon.cultivarId' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.divisionId' | 'unit.linkings.taxon.domainId' | 'unit.linkings.taxon.ecotypeId' | 'unit.linkings.taxon.euringCode' | 'unit.linkings.taxon.euringNumber' | 'unit.linkings.taxon.familyId' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.formId' | 'unit.linkings.taxon.genusId' | 'unit.linkings.taxon.groupId' | 'unit.linkings.taxon.habitats' | 'unit.linkings.taxon.hybridId' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.infraclassId' | 'unit.linkings.taxon.infradivisionId' | 'unit.linkings.taxon.infragenericHybridId' | 'unit.linkings.taxon.infragenericTaxonId' | 'unit.linkings.taxon.infrakingdomId' | 'unit.linkings.taxon.infraorderId' | 'unit.linkings.taxon.infraphylumId' | 'unit.linkings.taxon.infraspecificTaxonId' | 'unit.linkings.taxon.intergenericHybridId' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.kingdomId' | 'unit.linkings.taxon.nameAccordingTo' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.nothogenusId' | 'unit.linkings.taxon.nothospeciesId' | 'unit.linkings.taxon.nothosubspeciesId' | 'unit.linkings.taxon.orderId' | 'unit.linkings.taxon.parentId' | 'unit.linkings.taxon.parvclassId' | 'unit.linkings.taxon.parvorderId' | 'unit.linkings.taxon.phylumId' | 'unit.linkings.taxon.populationGroupId' | 'unit.linkings.taxon.primaryHabitat' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.sectionId' | 'unit.linkings.taxon.seriesId' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesAggregateId' | 'unit.linkings.taxon.speciesId' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.speciesTaxonomicOrder' | 'unit.linkings.taxon.subclassId' | 'unit.linkings.taxon.subdivisionId' | 'unit.linkings.taxon.subfamilyId' | 'unit.linkings.taxon.subformId' | 'unit.linkings.taxon.subgenusId' | 'unit.linkings.taxon.subkingdomId' | 'unit.linkings.taxon.suborderId' | 'unit.linkings.taxon.subphylumId' | 'unit.linkings.taxon.subsectionId' | 'unit.linkings.taxon.subseriesId' | 'unit.linkings.taxon.subspeciesId' | 'unit.linkings.taxon.subspecificAggregateId' | 'unit.linkings.taxon.subtribeId' | 'unit.linkings.taxon.subvarietyId' | 'unit.linkings.taxon.superclassId' | 'unit.linkings.taxon.superdivisionId' | 'unit.linkings.taxon.superdomainId' | 'unit.linkings.taxon.superfamilyId' | 'unit.linkings.taxon.supergenusId' | 'unit.linkings.taxon.superorderId' | 'unit.linkings.taxon.superphylumId' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.linkings.taxon.tribeId' | 'unit.linkings.taxon.typesOfOccurrenceInFinland' | 'unit.linkings.taxon.varietyId' | 'unit.media.author' | 'unit.media.copyrightOwner' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild' | 'count' | 'individualCountSum' | 'individualCountMax' | 'oldestRecord' | 'newestRecord' | 'pairCountMax' | 'pairCountSum' | 'firstLoadDateMin' | 'firstLoadDateMax'>;

    /**
     * Return only count of rows (default) or also additional aggregate function values.
     */
    onlyCount?: boolean;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Change response format to GeoJSON. To use this feature, you must aggregate by must contain two or four coordinate fields (lat,lon) or (latMin,latMax,lonMin,lonMax). The coordinate fields must be of the same type (wgs84,euref,ykj).
     */
    geoJSON?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'csv' | 'tsv';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Include or exclude nulls to result. Will only check nullness of the first aggregateBy field.
     */
    excludeNulls?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * Define fields to aggregate by. Multiple values are seperated by ','.
     */
    aggregateBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.copyrightOwner' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'gathering.team.memberId' | 'gathering.team.memberName' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.administrativeStatuses' | 'unit.linkings.originalTaxon.aggregateId' | 'unit.linkings.originalTaxon.anamorphId' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.birdlifeCode' | 'unit.linkings.originalTaxon.classId' | 'unit.linkings.originalTaxon.cultivarId' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.divisionId' | 'unit.linkings.originalTaxon.domainId' | 'unit.linkings.originalTaxon.ecotypeId' | 'unit.linkings.originalTaxon.euringCode' | 'unit.linkings.originalTaxon.euringNumber' | 'unit.linkings.originalTaxon.familyId' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.formId' | 'unit.linkings.originalTaxon.genusId' | 'unit.linkings.originalTaxon.groupId' | 'unit.linkings.originalTaxon.habitats' | 'unit.linkings.originalTaxon.hybridId' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.infraclassId' | 'unit.linkings.originalTaxon.infradivisionId' | 'unit.linkings.originalTaxon.infragenericHybridId' | 'unit.linkings.originalTaxon.infragenericTaxonId' | 'unit.linkings.originalTaxon.infrakingdomId' | 'unit.linkings.originalTaxon.infraorderId' | 'unit.linkings.originalTaxon.infraphylumId' | 'unit.linkings.originalTaxon.infraspecificTaxonId' | 'unit.linkings.originalTaxon.intergenericHybridId' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.kingdomId' | 'unit.linkings.originalTaxon.nameAccordingTo' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.nothogenusId' | 'unit.linkings.originalTaxon.nothospeciesId' | 'unit.linkings.originalTaxon.nothosubspeciesId' | 'unit.linkings.originalTaxon.orderId' | 'unit.linkings.originalTaxon.parentId' | 'unit.linkings.originalTaxon.parvclassId' | 'unit.linkings.originalTaxon.parvorderId' | 'unit.linkings.originalTaxon.phylumId' | 'unit.linkings.originalTaxon.populationGroupId' | 'unit.linkings.originalTaxon.primaryHabitat' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.sectionId' | 'unit.linkings.originalTaxon.seriesId' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesAggregateId' | 'unit.linkings.originalTaxon.speciesId' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.speciesTaxonomicOrder' | 'unit.linkings.originalTaxon.subclassId' | 'unit.linkings.originalTaxon.subdivisionId' | 'unit.linkings.originalTaxon.subfamilyId' | 'unit.linkings.originalTaxon.subformId' | 'unit.linkings.originalTaxon.subgenusId' | 'unit.linkings.originalTaxon.subkingdomId' | 'unit.linkings.originalTaxon.suborderId' | 'unit.linkings.originalTaxon.subphylumId' | 'unit.linkings.originalTaxon.subsectionId' | 'unit.linkings.originalTaxon.subseriesId' | 'unit.linkings.originalTaxon.subspeciesId' | 'unit.linkings.originalTaxon.subspecificAggregateId' | 'unit.linkings.originalTaxon.subtribeId' | 'unit.linkings.originalTaxon.subvarietyId' | 'unit.linkings.originalTaxon.superclassId' | 'unit.linkings.originalTaxon.superdivisionId' | 'unit.linkings.originalTaxon.superdomainId' | 'unit.linkings.originalTaxon.superfamilyId' | 'unit.linkings.originalTaxon.supergenusId' | 'unit.linkings.originalTaxon.superorderId' | 'unit.linkings.originalTaxon.superphylumId' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.originalTaxon.tribeId' | 'unit.linkings.originalTaxon.typesOfOccurrenceInFinland' | 'unit.linkings.originalTaxon.varietyId' | 'unit.linkings.taxon.administrativeStatuses' | 'unit.linkings.taxon.aggregateId' | 'unit.linkings.taxon.anamorphId' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.birdlifeCode' | 'unit.linkings.taxon.classId' | 'unit.linkings.taxon.cultivarId' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.divisionId' | 'unit.linkings.taxon.domainId' | 'unit.linkings.taxon.ecotypeId' | 'unit.linkings.taxon.euringCode' | 'unit.linkings.taxon.euringNumber' | 'unit.linkings.taxon.familyId' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.formId' | 'unit.linkings.taxon.genusId' | 'unit.linkings.taxon.groupId' | 'unit.linkings.taxon.habitats' | 'unit.linkings.taxon.hybridId' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.infraclassId' | 'unit.linkings.taxon.infradivisionId' | 'unit.linkings.taxon.infragenericHybridId' | 'unit.linkings.taxon.infragenericTaxonId' | 'unit.linkings.taxon.infrakingdomId' | 'unit.linkings.taxon.infraorderId' | 'unit.linkings.taxon.infraphylumId' | 'unit.linkings.taxon.infraspecificTaxonId' | 'unit.linkings.taxon.intergenericHybridId' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.kingdomId' | 'unit.linkings.taxon.nameAccordingTo' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.nothogenusId' | 'unit.linkings.taxon.nothospeciesId' | 'unit.linkings.taxon.nothosubspeciesId' | 'unit.linkings.taxon.orderId' | 'unit.linkings.taxon.parentId' | 'unit.linkings.taxon.parvclassId' | 'unit.linkings.taxon.parvorderId' | 'unit.linkings.taxon.phylumId' | 'unit.linkings.taxon.populationGroupId' | 'unit.linkings.taxon.primaryHabitat' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.sectionId' | 'unit.linkings.taxon.seriesId' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesAggregateId' | 'unit.linkings.taxon.speciesId' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.speciesTaxonomicOrder' | 'unit.linkings.taxon.subclassId' | 'unit.linkings.taxon.subdivisionId' | 'unit.linkings.taxon.subfamilyId' | 'unit.linkings.taxon.subformId' | 'unit.linkings.taxon.subgenusId' | 'unit.linkings.taxon.subkingdomId' | 'unit.linkings.taxon.suborderId' | 'unit.linkings.taxon.subphylumId' | 'unit.linkings.taxon.subsectionId' | 'unit.linkings.taxon.subseriesId' | 'unit.linkings.taxon.subspeciesId' | 'unit.linkings.taxon.subspecificAggregateId' | 'unit.linkings.taxon.subtribeId' | 'unit.linkings.taxon.subvarietyId' | 'unit.linkings.taxon.superclassId' | 'unit.linkings.taxon.superdivisionId' | 'unit.linkings.taxon.superdomainId' | 'unit.linkings.taxon.superfamilyId' | 'unit.linkings.taxon.supergenusId' | 'unit.linkings.taxon.superorderId' | 'unit.linkings.taxon.superphylumId' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.linkings.taxon.tribeId' | 'unit.linkings.taxon.typesOfOccurrenceInFinland' | 'unit.linkings.taxon.varietyId' | 'unit.media.author' | 'unit.media.copyrightOwner' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/csv' | 'application/tsv';
  }

  /**
   * Parameters for getWarehouseQuerySingle
   */
  export interface GetWarehouseQuerySingleParams {

    /**
     * Full document ID (URI identifier)
     */
    documentId: string;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml';

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml';
  }

  /**
   * Parameters for getWarehouseQueryStatistics
   */
  export interface GetWarehouseQueryStatisticsParams {

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Value of this parameter affects how oldestRecord and newestRecord are calculated regarding observations reported as date span. False (default): oldest=min(date.begin), newest=max(date.end). True: oldest=min(date.end), newest=max(date.begin).
     */
    pessimisticDateRangeHandling?: boolean;

    /**
     * Include pair count sum and max.
     */
    pairCounts?: boolean;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to count (desc) and each aggregate by field (asc). Each fieldname given as parameter defaults to ASC - if you want to sort using descending order, add " DESC" to the end of the field name. In addition to aggregateBy fields you can use the following aggregate function names: [count, individualCountSum, individualCountMax, oldestRecord, newestRecord, pairCountMax, pairCountSum, firstLoadDateMin, firstLoadDateMax]. Multiple values are seperated by ','.
     */
    orderBy?: Array<'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'gathering.conversions.month' | 'gathering.conversions.year' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'unit.linkings.originalTaxon.administrativeStatuses' | 'unit.linkings.originalTaxon.aggregateId' | 'unit.linkings.originalTaxon.anamorphId' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.birdlifeCode' | 'unit.linkings.originalTaxon.classId' | 'unit.linkings.originalTaxon.cultivarId' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.divisionId' | 'unit.linkings.originalTaxon.domainId' | 'unit.linkings.originalTaxon.ecotypeId' | 'unit.linkings.originalTaxon.euringCode' | 'unit.linkings.originalTaxon.euringNumber' | 'unit.linkings.originalTaxon.familyId' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.formId' | 'unit.linkings.originalTaxon.genusId' | 'unit.linkings.originalTaxon.groupId' | 'unit.linkings.originalTaxon.habitats' | 'unit.linkings.originalTaxon.hybridId' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.infraclassId' | 'unit.linkings.originalTaxon.infradivisionId' | 'unit.linkings.originalTaxon.infragenericHybridId' | 'unit.linkings.originalTaxon.infragenericTaxonId' | 'unit.linkings.originalTaxon.infrakingdomId' | 'unit.linkings.originalTaxon.infraorderId' | 'unit.linkings.originalTaxon.infraphylumId' | 'unit.linkings.originalTaxon.infraspecificTaxonId' | 'unit.linkings.originalTaxon.intergenericHybridId' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.kingdomId' | 'unit.linkings.originalTaxon.nameAccordingTo' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.nothogenusId' | 'unit.linkings.originalTaxon.nothospeciesId' | 'unit.linkings.originalTaxon.nothosubspeciesId' | 'unit.linkings.originalTaxon.orderId' | 'unit.linkings.originalTaxon.parentId' | 'unit.linkings.originalTaxon.parvclassId' | 'unit.linkings.originalTaxon.parvorderId' | 'unit.linkings.originalTaxon.phylumId' | 'unit.linkings.originalTaxon.populationGroupId' | 'unit.linkings.originalTaxon.primaryHabitat' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.sectionId' | 'unit.linkings.originalTaxon.seriesId' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesAggregateId' | 'unit.linkings.originalTaxon.speciesId' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.speciesTaxonomicOrder' | 'unit.linkings.originalTaxon.subclassId' | 'unit.linkings.originalTaxon.subdivisionId' | 'unit.linkings.originalTaxon.subfamilyId' | 'unit.linkings.originalTaxon.subformId' | 'unit.linkings.originalTaxon.subgenusId' | 'unit.linkings.originalTaxon.subkingdomId' | 'unit.linkings.originalTaxon.suborderId' | 'unit.linkings.originalTaxon.subphylumId' | 'unit.linkings.originalTaxon.subsectionId' | 'unit.linkings.originalTaxon.subseriesId' | 'unit.linkings.originalTaxon.subspeciesId' | 'unit.linkings.originalTaxon.subspecificAggregateId' | 'unit.linkings.originalTaxon.subtribeId' | 'unit.linkings.originalTaxon.subvarietyId' | 'unit.linkings.originalTaxon.superclassId' | 'unit.linkings.originalTaxon.superdivisionId' | 'unit.linkings.originalTaxon.superdomainId' | 'unit.linkings.originalTaxon.superfamilyId' | 'unit.linkings.originalTaxon.supergenusId' | 'unit.linkings.originalTaxon.superorderId' | 'unit.linkings.originalTaxon.superphylumId' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.originalTaxon.tribeId' | 'unit.linkings.originalTaxon.typesOfOccurrenceInFinland' | 'unit.linkings.originalTaxon.varietyId' | 'unit.linkings.taxon.administrativeStatuses' | 'unit.linkings.taxon.aggregateId' | 'unit.linkings.taxon.anamorphId' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.birdlifeCode' | 'unit.linkings.taxon.classId' | 'unit.linkings.taxon.cultivarId' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.divisionId' | 'unit.linkings.taxon.domainId' | 'unit.linkings.taxon.ecotypeId' | 'unit.linkings.taxon.euringCode' | 'unit.linkings.taxon.euringNumber' | 'unit.linkings.taxon.familyId' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.formId' | 'unit.linkings.taxon.genusId' | 'unit.linkings.taxon.groupId' | 'unit.linkings.taxon.habitats' | 'unit.linkings.taxon.hybridId' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.infraclassId' | 'unit.linkings.taxon.infradivisionId' | 'unit.linkings.taxon.infragenericHybridId' | 'unit.linkings.taxon.infragenericTaxonId' | 'unit.linkings.taxon.infrakingdomId' | 'unit.linkings.taxon.infraorderId' | 'unit.linkings.taxon.infraphylumId' | 'unit.linkings.taxon.infraspecificTaxonId' | 'unit.linkings.taxon.intergenericHybridId' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.kingdomId' | 'unit.linkings.taxon.nameAccordingTo' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.nothogenusId' | 'unit.linkings.taxon.nothospeciesId' | 'unit.linkings.taxon.nothosubspeciesId' | 'unit.linkings.taxon.orderId' | 'unit.linkings.taxon.parentId' | 'unit.linkings.taxon.parvclassId' | 'unit.linkings.taxon.parvorderId' | 'unit.linkings.taxon.phylumId' | 'unit.linkings.taxon.populationGroupId' | 'unit.linkings.taxon.primaryHabitat' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.sectionId' | 'unit.linkings.taxon.seriesId' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesAggregateId' | 'unit.linkings.taxon.speciesId' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.speciesTaxonomicOrder' | 'unit.linkings.taxon.subclassId' | 'unit.linkings.taxon.subdivisionId' | 'unit.linkings.taxon.subfamilyId' | 'unit.linkings.taxon.subformId' | 'unit.linkings.taxon.subgenusId' | 'unit.linkings.taxon.subkingdomId' | 'unit.linkings.taxon.suborderId' | 'unit.linkings.taxon.subphylumId' | 'unit.linkings.taxon.subsectionId' | 'unit.linkings.taxon.subseriesId' | 'unit.linkings.taxon.subspeciesId' | 'unit.linkings.taxon.subspecificAggregateId' | 'unit.linkings.taxon.subtribeId' | 'unit.linkings.taxon.subvarietyId' | 'unit.linkings.taxon.superclassId' | 'unit.linkings.taxon.superdivisionId' | 'unit.linkings.taxon.superdomainId' | 'unit.linkings.taxon.superfamilyId' | 'unit.linkings.taxon.supergenusId' | 'unit.linkings.taxon.superorderId' | 'unit.linkings.taxon.superphylumId' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.linkings.taxon.tribeId' | 'unit.linkings.taxon.typesOfOccurrenceInFinland' | 'unit.linkings.taxon.varietyId' | 'count' | 'individualCountSum' | 'individualCountMax' | 'oldestRecord' | 'newestRecord' | 'pairCountMax' | 'pairCountSum' | 'firstLoadDateMin' | 'firstLoadDateMax'>;

    /**
     * Return only count of rows (default) or also additional aggregate function values.
     */
    onlyCount?: boolean;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'csv' | 'tsv';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Include or exclude nulls to result. Will only check nullness of the first aggregateBy field.
     */
    excludeNulls?: boolean;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Define fields to aggregate by. Multiple values are seperated by ','.
     */
    aggregateBy?: Array<'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'gathering.conversions.month' | 'gathering.conversions.year' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'unit.linkings.originalTaxon.administrativeStatuses' | 'unit.linkings.originalTaxon.aggregateId' | 'unit.linkings.originalTaxon.anamorphId' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.birdlifeCode' | 'unit.linkings.originalTaxon.classId' | 'unit.linkings.originalTaxon.cultivarId' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.divisionId' | 'unit.linkings.originalTaxon.domainId' | 'unit.linkings.originalTaxon.ecotypeId' | 'unit.linkings.originalTaxon.euringCode' | 'unit.linkings.originalTaxon.euringNumber' | 'unit.linkings.originalTaxon.familyId' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.formId' | 'unit.linkings.originalTaxon.genusId' | 'unit.linkings.originalTaxon.groupId' | 'unit.linkings.originalTaxon.habitats' | 'unit.linkings.originalTaxon.hybridId' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.infraclassId' | 'unit.linkings.originalTaxon.infradivisionId' | 'unit.linkings.originalTaxon.infragenericHybridId' | 'unit.linkings.originalTaxon.infragenericTaxonId' | 'unit.linkings.originalTaxon.infrakingdomId' | 'unit.linkings.originalTaxon.infraorderId' | 'unit.linkings.originalTaxon.infraphylumId' | 'unit.linkings.originalTaxon.infraspecificTaxonId' | 'unit.linkings.originalTaxon.intergenericHybridId' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.kingdomId' | 'unit.linkings.originalTaxon.nameAccordingTo' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.nothogenusId' | 'unit.linkings.originalTaxon.nothospeciesId' | 'unit.linkings.originalTaxon.nothosubspeciesId' | 'unit.linkings.originalTaxon.orderId' | 'unit.linkings.originalTaxon.parentId' | 'unit.linkings.originalTaxon.parvclassId' | 'unit.linkings.originalTaxon.parvorderId' | 'unit.linkings.originalTaxon.phylumId' | 'unit.linkings.originalTaxon.populationGroupId' | 'unit.linkings.originalTaxon.primaryHabitat' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.sectionId' | 'unit.linkings.originalTaxon.seriesId' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesAggregateId' | 'unit.linkings.originalTaxon.speciesId' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.speciesTaxonomicOrder' | 'unit.linkings.originalTaxon.subclassId' | 'unit.linkings.originalTaxon.subdivisionId' | 'unit.linkings.originalTaxon.subfamilyId' | 'unit.linkings.originalTaxon.subformId' | 'unit.linkings.originalTaxon.subgenusId' | 'unit.linkings.originalTaxon.subkingdomId' | 'unit.linkings.originalTaxon.suborderId' | 'unit.linkings.originalTaxon.subphylumId' | 'unit.linkings.originalTaxon.subsectionId' | 'unit.linkings.originalTaxon.subseriesId' | 'unit.linkings.originalTaxon.subspeciesId' | 'unit.linkings.originalTaxon.subspecificAggregateId' | 'unit.linkings.originalTaxon.subtribeId' | 'unit.linkings.originalTaxon.subvarietyId' | 'unit.linkings.originalTaxon.superclassId' | 'unit.linkings.originalTaxon.superdivisionId' | 'unit.linkings.originalTaxon.superdomainId' | 'unit.linkings.originalTaxon.superfamilyId' | 'unit.linkings.originalTaxon.supergenusId' | 'unit.linkings.originalTaxon.superorderId' | 'unit.linkings.originalTaxon.superphylumId' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.originalTaxon.tribeId' | 'unit.linkings.originalTaxon.typesOfOccurrenceInFinland' | 'unit.linkings.originalTaxon.varietyId' | 'unit.linkings.taxon.administrativeStatuses' | 'unit.linkings.taxon.aggregateId' | 'unit.linkings.taxon.anamorphId' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.birdlifeCode' | 'unit.linkings.taxon.classId' | 'unit.linkings.taxon.cultivarId' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.divisionId' | 'unit.linkings.taxon.domainId' | 'unit.linkings.taxon.ecotypeId' | 'unit.linkings.taxon.euringCode' | 'unit.linkings.taxon.euringNumber' | 'unit.linkings.taxon.familyId' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.formId' | 'unit.linkings.taxon.genusId' | 'unit.linkings.taxon.groupId' | 'unit.linkings.taxon.habitats' | 'unit.linkings.taxon.hybridId' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.infraclassId' | 'unit.linkings.taxon.infradivisionId' | 'unit.linkings.taxon.infragenericHybridId' | 'unit.linkings.taxon.infragenericTaxonId' | 'unit.linkings.taxon.infrakingdomId' | 'unit.linkings.taxon.infraorderId' | 'unit.linkings.taxon.infraphylumId' | 'unit.linkings.taxon.infraspecificTaxonId' | 'unit.linkings.taxon.intergenericHybridId' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.kingdomId' | 'unit.linkings.taxon.nameAccordingTo' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.nothogenusId' | 'unit.linkings.taxon.nothospeciesId' | 'unit.linkings.taxon.nothosubspeciesId' | 'unit.linkings.taxon.orderId' | 'unit.linkings.taxon.parentId' | 'unit.linkings.taxon.parvclassId' | 'unit.linkings.taxon.parvorderId' | 'unit.linkings.taxon.phylumId' | 'unit.linkings.taxon.populationGroupId' | 'unit.linkings.taxon.primaryHabitat' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.sectionId' | 'unit.linkings.taxon.seriesId' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesAggregateId' | 'unit.linkings.taxon.speciesId' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.speciesTaxonomicOrder' | 'unit.linkings.taxon.subclassId' | 'unit.linkings.taxon.subdivisionId' | 'unit.linkings.taxon.subfamilyId' | 'unit.linkings.taxon.subformId' | 'unit.linkings.taxon.subgenusId' | 'unit.linkings.taxon.subkingdomId' | 'unit.linkings.taxon.suborderId' | 'unit.linkings.taxon.subphylumId' | 'unit.linkings.taxon.subsectionId' | 'unit.linkings.taxon.subseriesId' | 'unit.linkings.taxon.subspeciesId' | 'unit.linkings.taxon.subspecificAggregateId' | 'unit.linkings.taxon.subtribeId' | 'unit.linkings.taxon.subvarietyId' | 'unit.linkings.taxon.superclassId' | 'unit.linkings.taxon.superdivisionId' | 'unit.linkings.taxon.superdomainId' | 'unit.linkings.taxon.superfamilyId' | 'unit.linkings.taxon.supergenusId' | 'unit.linkings.taxon.superorderId' | 'unit.linkings.taxon.superphylumId' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.linkings.taxon.tribeId' | 'unit.linkings.taxon.typesOfOccurrenceInFinland' | 'unit.linkings.taxon.varietyId'>;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/csv' | 'application/tsv';
  }

  /**
   * Parameters for getWarehouseQueryAnnotationList
   */
  export interface GetWarehouseQueryAnnotationListParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Define what fields to include to the result. Defaults to [annotation.annotationByPerson, annotation.annotationByPersonName, annotation.annotationBySystem, annotation.annotationBySystemName, annotation.annotationClass, annotation.created, annotation.id, annotation.invasiveControlEffectiveness, annotation.notes, annotation.opinion, annotation.rootID, annotation.targetID, annotation.type, document.collectionId, document.documentId, gathering.displayDateTime, gathering.team, unit.linkings.originalTaxon.id, unit.linkings.originalTaxon.scientificName, unit.linkings.originalTaxon.vernacularName, unit.linkings.taxon.id, unit.linkings.taxon.scientificName, unit.linkings.taxon.vernacularName, unit.taxonVerbatim, unit.unitId] Multiple values are seperated by ','.
     */
    selected?: Array<'annotation.annotationByPerson' | 'annotation.annotationByPersonName' | 'annotation.annotationBySystem' | 'annotation.annotationBySystemName' | 'annotation.annotationClass' | 'annotation.created' | 'annotation.id' | 'annotation.invasiveControlEffectiveness' | 'annotation.notes' | 'annotation.opinion' | 'annotation.rootID' | 'annotation.targetID' | 'annotation.type' | 'document.annotations.annotationByPerson' | 'document.annotations.annotationByPersonName' | 'document.annotations.annotationBySystem' | 'document.annotations.annotationBySystemName' | 'document.annotations.annotationClass' | 'document.annotations.created' | 'document.annotations.id' | 'document.annotations.invasiveControlEffectiveness' | 'document.annotations.notes' | 'document.annotations.opinion' | 'document.annotations.rootID' | 'document.annotations.targetID' | 'document.annotations.type' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors.fullName' | 'document.linkings.editors.id' | 'document.linkings.editors.userId' | 'document.loadDate' | 'document.media.author' | 'document.media.caption' | 'document.media.copyrightOwner' | 'document.media.fullURL' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.media.squareThumbnailURL' | 'document.media.thumbnailURL' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlaceId' | 'document.notes' | 'document.partial' | 'document.quality.issue.issue' | 'document.quality.issue.message' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.biogeographicalProvinces' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipalities' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers.fullName' | 'gathering.linkings.observers.id' | 'gathering.linkings.observers.userId' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.caption' | 'gathering.media.copyrightOwner' | 'gathering.media.fullURL' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.media.squareThumbnailURL' | 'gathering.media.thumbnailURL' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.notes' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.message' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.message' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.message' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.notes' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.checklist' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameAuthorship' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.vernacularName' | 'unit.linkings.taxon.checklist' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameAuthorship' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.vernacularName' | 'unit.media.author' | 'unit.media.caption' | 'unit.media.copyrightOwner' | 'unit.media.fullURL' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.media.squareThumbnailURL' | 'unit.media.thumbnailURL' | 'unit.mediaCount' | 'unit.notes' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.message' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.message' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.reportedTaxonId' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.notes' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to [unit.annotations.created DESC]. Unit key is always added as a last parameter to ensure correct paging. You can include ASC or DESC after the name of the field (defaults to ASC).Multiple values are seperated by ','.
     */
    orderBy?: Array<'RANDOM' | 'RANDOM:seed' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.firstLoadDate' | 'document.loadDate' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.name' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.locality' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.team' | 'unit.abundanceString' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedTaxonConfidence' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * Include those annotations that are made by automated quality checks. Defaults to false.
     */
    includeSystemAnnotations?: boolean;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'dwc_xml';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units/annotations that are of the selected annotation type. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    annotationType?: string;

    /**
     * Include only those annotations that have been made before or on the same date. Format is yyyy-MM-dd.
     */
    annotatedSameOrBefore?: string;

    /**
     * Include only those annotations that have been made after or on the same date. Format is yyyy-MM-dd.
     */
    annotatedSameOrAfter?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/dwc+xml';
  }

  /**
   * Parameters for getWarehouseQueryUnitMediaList
   */
  export interface GetWarehouseQueryUnitMediaListParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Define what fields to include to the result. Defaults to [document.documentId, media.author, media.caption, media.copyrightOwner, media.fullURL, media.licenseAbbreviation, media.licenseId, media.mediaType, media.squareThumbnailURL, media.thumbnailURL, unit.linkings.taxon.scientificName, unit.linkings.taxon.vernacularName, unit.reportedInformalTaxonGroup, unit.taxonVerbatim, unit.unitId] Multiple values are seperated by ','.
     */
    selected?: Array<'document.annotations.annotationByPerson' | 'document.annotations.annotationByPersonName' | 'document.annotations.annotationBySystem' | 'document.annotations.annotationBySystemName' | 'document.annotations.annotationClass' | 'document.annotations.created' | 'document.annotations.id' | 'document.annotations.invasiveControlEffectiveness' | 'document.annotations.notes' | 'document.annotations.opinion' | 'document.annotations.rootID' | 'document.annotations.targetID' | 'document.annotations.type' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors.fullName' | 'document.linkings.editors.id' | 'document.linkings.editors.userId' | 'document.loadDate' | 'document.media.author' | 'document.media.caption' | 'document.media.copyrightOwner' | 'document.media.fullURL' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.media.squareThumbnailURL' | 'document.media.thumbnailURL' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlaceId' | 'document.notes' | 'document.partial' | 'document.quality.issue.issue' | 'document.quality.issue.message' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.biogeographicalProvinces' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipalities' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers.fullName' | 'gathering.linkings.observers.id' | 'gathering.linkings.observers.userId' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.caption' | 'gathering.media.copyrightOwner' | 'gathering.media.fullURL' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.media.squareThumbnailURL' | 'gathering.media.thumbnailURL' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.notes' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.message' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.message' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.message' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'media.author' | 'media.caption' | 'media.copyrightOwner' | 'media.fullURL' | 'media.licenseAbbreviation' | 'media.licenseId' | 'media.mediaType' | 'media.squareThumbnailURL' | 'media.thumbnailURL' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.notes' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.checklist' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameAuthorship' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.vernacularName' | 'unit.linkings.taxon.checklist' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameAuthorship' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.vernacularName' | 'unit.media.author' | 'unit.media.caption' | 'unit.media.copyrightOwner' | 'unit.media.fullURL' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.media.squareThumbnailURL' | 'unit.media.thumbnailURL' | 'unit.mediaCount' | 'unit.notes' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.message' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.message' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.reportedTaxonId' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.notes' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to [gathering.eventDate.begin DESC, document.loadDate DESC, unit.taxonVerbatim ASC]. Unit key is always added as a last parameter to ensure correct paging. You can include ASC or DESC after the name of the field (defaults to ASC).Multiple values are seperated by ','.
     */
    orderBy?: Array<'RANDOM' | 'RANDOM:seed' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.firstLoadDate' | 'document.loadDate' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.name' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.locality' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.team' | 'unit.abundanceString' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedTaxonConfidence' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'dwc_xml';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/dwc+xml';
  }

  /**
   * Parameters for getWarehouseQuerySampleList
   */
  export interface GetWarehouseQuerySampleListParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Define what fields to include to the result. Defaults to [document.documentId, sample.collectionId, sample.facts.decimalValue, sample.facts.fact, sample.facts.integerValue, sample.facts.value, sample.keywords, sample.material, sample.multiple, sample.notes, sample.quality, sample.sampleId, sample.sampleOrder, sample.status, sample.type, unit.linkings.taxon.id, unit.linkings.taxon.scientificName, unit.taxonVerbatim, unit.unitId] Multiple values are seperated by ','.
     */
    selected?: Array<'document.annotations.annotationByPerson' | 'document.annotations.annotationByPersonName' | 'document.annotations.annotationBySystem' | 'document.annotations.annotationBySystemName' | 'document.annotations.annotationClass' | 'document.annotations.created' | 'document.annotations.id' | 'document.annotations.invasiveControlEffectiveness' | 'document.annotations.notes' | 'document.annotations.opinion' | 'document.annotations.rootID' | 'document.annotations.targetID' | 'document.annotations.type' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors.fullName' | 'document.linkings.editors.id' | 'document.linkings.editors.userId' | 'document.loadDate' | 'document.media.author' | 'document.media.caption' | 'document.media.copyrightOwner' | 'document.media.fullURL' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.media.squareThumbnailURL' | 'document.media.thumbnailURL' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlaceId' | 'document.notes' | 'document.partial' | 'document.quality.issue.issue' | 'document.quality.issue.message' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.biogeographicalProvinces' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipalities' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers.fullName' | 'gathering.linkings.observers.id' | 'gathering.linkings.observers.userId' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.caption' | 'gathering.media.copyrightOwner' | 'gathering.media.fullURL' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.media.squareThumbnailURL' | 'gathering.media.thumbnailURL' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.notes' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.message' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.message' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.message' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'sample.collectionId' | 'sample.facts.decimalValue' | 'sample.facts.fact' | 'sample.facts.integerValue' | 'sample.facts.value' | 'sample.keywords' | 'sample.material' | 'sample.multiple' | 'sample.notes' | 'sample.quality' | 'sample.sampleId' | 'sample.sampleOrder' | 'sample.status' | 'sample.type' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.notes' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.checklist' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameAuthorship' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.vernacularName' | 'unit.linkings.taxon.checklist' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameAuthorship' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.vernacularName' | 'unit.media.author' | 'unit.media.caption' | 'unit.media.copyrightOwner' | 'unit.media.fullURL' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.media.squareThumbnailURL' | 'unit.media.thumbnailURL' | 'unit.mediaCount' | 'unit.notes' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.message' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.message' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.reportedTaxonId' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.notes' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Filter based on URI or Qname identifier of MF.preparationTypeEnum (use metadata-api to resolve identifiers) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sampleType?: string;

    /**
     * Filter based on URI or Qname identifier of MY.statuses (use metadata-api to resolve identifiers) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sampleStatus?: string;

    /**
     * Filter based on URI or Qname identifier of MF.qualityEnum (use metadata-api to resolve identifiers) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sampleQuality?: string;

    /**
     * Was DNA extracted from single or multiple individuals? Include only those that were (true) or weren't (false).
     */
    sampleMultiple?: boolean;

    /**
     * Filter based on URI or Qname identifier of MY.statuses (use metadata-api to resolve identifiers) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sampleMaterial?: string;

    /**
     * Filter using preparation/sample ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sampleId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    sampleFact?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sampleCollectionId?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to [unit.taxonVerbatim ASC, unit.unitId ASC, unit.samples.sampleOrder ASC]. Unit key is always added as a last parameter to ensure correct paging. You can include ASC or DESC after the name of the field (defaults to ASC).Multiple values are seperated by ','.
     */
    orderBy?: Array<'RANDOM' | 'RANDOM:seed' | 'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.firstLoadDate' | 'document.loadDate' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.name' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.locality' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.team' | 'unit.abundanceString' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedTaxonConfidence' | 'unit.samples.collectionId' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'dwc_xml';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/dwc+xml';
  }

  /**
   * Parameters for getWarehouseQueryAnnotationAggregate
   */
  export interface GetWarehouseQueryAnnotationAggregateParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter occurrences based on reported/annotated wild status. By default, non-wild occurrences are exluded. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wild?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * By default, all taxon linking related filters use taxon linking that may have been altered because of quality control identification annotations. If you want to use original user identifications, set this to false.
     */
    useIdentificationAnnotations?: boolean;

    /**
     * Filter using unit ids.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    unitId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    unitFact?: string;

    /**
     * Show only unidentified records (does not link to any taxon or links to higher taxon rank than species or taxonconfidence is unsure)
     */
    unidentified?: boolean;

    /**
     * Filter only type specimens or those that are not type specimens.
     */
    typeSpecimen?: boolean;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are not marked with any of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of type of occurrence in Finland. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with one or more of the specified statuses. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    typeOfOccurrenceId?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Filter using reliability of observation/taxon identification. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonReliability?: string;

    /**
     * Filter based on URI or Qname identifier of taxon rank. Use Metadata-API to find identifiers. Will return entries of taxons that are of the specified ranks. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonRankId?: string;

    /**
     * Filter based on URI or Qname identifier of a taxon. Use Taxonomy-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonId?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Same as taxonId, but system resolves identifier of the taxon based on the given target name. If no such match can be resolved (name does not exist in taxonomy), will filter based on the given verbatim target name (case insensitive). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    target?: string;

    /**
     * Filter using super record basis.  Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    superRecordBasis?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Filter using sex of an unit. When filtering MALE or FEMALE, will include those where individualCountMale/Female is >= 1 Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sex?: string;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Include only those units that are reliable or are not reliable.
     */
    reliable?: boolean;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of red list status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the red list status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    redListStatusId?: string;

    /**
     * Filter using record basis. This can be used for example to get only preserved specimens. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    recordBasis?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Filter based on primary habitat of taxa. Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    primaryHabitat?: string;

    /**
     * Value of this parameter affects how oldestRecord and newestRecord are calculated regarding observations reported as date span. False (default): oldest=min(date.begin), newest=max(date.end). True: oldest=min(date.end), newest=max(date.begin).
     */
    pessimisticDateRangeHandling?: boolean;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to count (desc) and each aggregate by field (asc). Each fieldname given as parameter defaults to ASC - if you want to sort using descending order, add " DESC" to the end of the field name. In addition to aggregateBy fields you can use the following aggregate function names: [count, individualCountSum, individualCountMax, oldestRecord, newestRecord, pairCountMax, pairCountSum, firstLoadDateMin, firstLoadDateMax]. Multiple values are seperated by ','.
     */
    orderBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.copyrightOwner' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'gathering.team.memberId' | 'gathering.team.memberName' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.administrativeStatuses' | 'unit.linkings.originalTaxon.aggregateId' | 'unit.linkings.originalTaxon.anamorphId' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.birdlifeCode' | 'unit.linkings.originalTaxon.classId' | 'unit.linkings.originalTaxon.cultivarId' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.divisionId' | 'unit.linkings.originalTaxon.domainId' | 'unit.linkings.originalTaxon.ecotypeId' | 'unit.linkings.originalTaxon.euringCode' | 'unit.linkings.originalTaxon.euringNumber' | 'unit.linkings.originalTaxon.familyId' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.formId' | 'unit.linkings.originalTaxon.genusId' | 'unit.linkings.originalTaxon.groupId' | 'unit.linkings.originalTaxon.habitats' | 'unit.linkings.originalTaxon.hybridId' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.infraclassId' | 'unit.linkings.originalTaxon.infradivisionId' | 'unit.linkings.originalTaxon.infragenericHybridId' | 'unit.linkings.originalTaxon.infragenericTaxonId' | 'unit.linkings.originalTaxon.infrakingdomId' | 'unit.linkings.originalTaxon.infraorderId' | 'unit.linkings.originalTaxon.infraphylumId' | 'unit.linkings.originalTaxon.infraspecificTaxonId' | 'unit.linkings.originalTaxon.intergenericHybridId' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.kingdomId' | 'unit.linkings.originalTaxon.nameAccordingTo' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.nothogenusId' | 'unit.linkings.originalTaxon.nothospeciesId' | 'unit.linkings.originalTaxon.nothosubspeciesId' | 'unit.linkings.originalTaxon.orderId' | 'unit.linkings.originalTaxon.parentId' | 'unit.linkings.originalTaxon.parvclassId' | 'unit.linkings.originalTaxon.parvorderId' | 'unit.linkings.originalTaxon.phylumId' | 'unit.linkings.originalTaxon.populationGroupId' | 'unit.linkings.originalTaxon.primaryHabitat' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.sectionId' | 'unit.linkings.originalTaxon.seriesId' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesAggregateId' | 'unit.linkings.originalTaxon.speciesId' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.speciesTaxonomicOrder' | 'unit.linkings.originalTaxon.subclassId' | 'unit.linkings.originalTaxon.subdivisionId' | 'unit.linkings.originalTaxon.subfamilyId' | 'unit.linkings.originalTaxon.subformId' | 'unit.linkings.originalTaxon.subgenusId' | 'unit.linkings.originalTaxon.subkingdomId' | 'unit.linkings.originalTaxon.suborderId' | 'unit.linkings.originalTaxon.subphylumId' | 'unit.linkings.originalTaxon.subsectionId' | 'unit.linkings.originalTaxon.subseriesId' | 'unit.linkings.originalTaxon.subspeciesId' | 'unit.linkings.originalTaxon.subspecificAggregateId' | 'unit.linkings.originalTaxon.subtribeId' | 'unit.linkings.originalTaxon.subvarietyId' | 'unit.linkings.originalTaxon.superclassId' | 'unit.linkings.originalTaxon.superdivisionId' | 'unit.linkings.originalTaxon.superdomainId' | 'unit.linkings.originalTaxon.superfamilyId' | 'unit.linkings.originalTaxon.supergenusId' | 'unit.linkings.originalTaxon.superorderId' | 'unit.linkings.originalTaxon.superphylumId' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.originalTaxon.tribeId' | 'unit.linkings.originalTaxon.typesOfOccurrenceInFinland' | 'unit.linkings.originalTaxon.varietyId' | 'unit.linkings.taxon.administrativeStatuses' | 'unit.linkings.taxon.aggregateId' | 'unit.linkings.taxon.anamorphId' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.birdlifeCode' | 'unit.linkings.taxon.classId' | 'unit.linkings.taxon.cultivarId' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.divisionId' | 'unit.linkings.taxon.domainId' | 'unit.linkings.taxon.ecotypeId' | 'unit.linkings.taxon.euringCode' | 'unit.linkings.taxon.euringNumber' | 'unit.linkings.taxon.familyId' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.formId' | 'unit.linkings.taxon.genusId' | 'unit.linkings.taxon.groupId' | 'unit.linkings.taxon.habitats' | 'unit.linkings.taxon.hybridId' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.infraclassId' | 'unit.linkings.taxon.infradivisionId' | 'unit.linkings.taxon.infragenericHybridId' | 'unit.linkings.taxon.infragenericTaxonId' | 'unit.linkings.taxon.infrakingdomId' | 'unit.linkings.taxon.infraorderId' | 'unit.linkings.taxon.infraphylumId' | 'unit.linkings.taxon.infraspecificTaxonId' | 'unit.linkings.taxon.intergenericHybridId' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.kingdomId' | 'unit.linkings.taxon.nameAccordingTo' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.nothogenusId' | 'unit.linkings.taxon.nothospeciesId' | 'unit.linkings.taxon.nothosubspeciesId' | 'unit.linkings.taxon.orderId' | 'unit.linkings.taxon.parentId' | 'unit.linkings.taxon.parvclassId' | 'unit.linkings.taxon.parvorderId' | 'unit.linkings.taxon.phylumId' | 'unit.linkings.taxon.populationGroupId' | 'unit.linkings.taxon.primaryHabitat' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.sectionId' | 'unit.linkings.taxon.seriesId' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesAggregateId' | 'unit.linkings.taxon.speciesId' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.speciesTaxonomicOrder' | 'unit.linkings.taxon.subclassId' | 'unit.linkings.taxon.subdivisionId' | 'unit.linkings.taxon.subfamilyId' | 'unit.linkings.taxon.subformId' | 'unit.linkings.taxon.subgenusId' | 'unit.linkings.taxon.subkingdomId' | 'unit.linkings.taxon.suborderId' | 'unit.linkings.taxon.subphylumId' | 'unit.linkings.taxon.subsectionId' | 'unit.linkings.taxon.subseriesId' | 'unit.linkings.taxon.subspeciesId' | 'unit.linkings.taxon.subspecificAggregateId' | 'unit.linkings.taxon.subtribeId' | 'unit.linkings.taxon.subvarietyId' | 'unit.linkings.taxon.superclassId' | 'unit.linkings.taxon.superdivisionId' | 'unit.linkings.taxon.superdomainId' | 'unit.linkings.taxon.superfamilyId' | 'unit.linkings.taxon.supergenusId' | 'unit.linkings.taxon.superorderId' | 'unit.linkings.taxon.superphylumId' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.linkings.taxon.tribeId' | 'unit.linkings.taxon.typesOfOccurrenceInFinland' | 'unit.linkings.taxon.varietyId' | 'unit.media.author' | 'unit.media.copyrightOwner' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild' | 'count' | 'individualCountSum' | 'individualCountMax' | 'oldestRecord' | 'newestRecord' | 'pairCountMax' | 'pairCountSum' | 'firstLoadDateMin' | 'firstLoadDateMax'>;

    /**
     * Return only count of rows (default) or also additional aggregate function values.
     */
    onlyCount?: boolean;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using life stage of an unit. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    lifeStage?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Filter only invasives that are reported to have been controlled successfully or not reported to have been controlled succesfully.
     */
    invasiveControlled?: boolean;

    /**
     * Filter using effectiveness of invasive control measures Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    invasiveControl?: string;

    /**
     * Filter only those taxons that are invasive or are not invasive.
     */
    invasive?: boolean;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups OR reported to belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupIdIncludingReported?: string;

    /**
     * Filter based on URI or Qname identifier of an informal taxon group. Use InformalTaxonGroups-API to find identifiers. Will return entries that have been linked with taxa that belong to one of the given groups. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    informalTaxonGroupId?: string;

    /**
     * Filter using identifier of an individual, for example bird ring. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    individualId?: string;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "zero observations" use max=0. Defaults to 1 but when using annotation endpoint defaults to null
     */
    individualCountMin?: number;

    /**
     * Filter using idividual count. Unreported individual count is assumed to mean "1+", so searching min=1 returns where count > 0 or count is not given. To search for "null observations" use max=0.
     */
    individualCountMax?: number;

    /**
     * Include those annotations that are made by automated quality checks. Defaults to false.
     */
    includeSystemAnnotations?: boolean;

    /**
     * By default, all taxon linking related filters return all entries that belong to the filtered taxa. To return only exact matches (no subtaxa), set this to false.
     */
    includeSubTaxa?: boolean;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Set to false if you want to include only those entires where reported target name can be linked with a taxon of the reference taxonomy. By default includes all entries.
     */
    includeNonValidTaxa?: boolean;

    /**
     * Filter only units where unit has media or doesn't have media.
     */
    hasUnitMedia?: boolean;

    /**
     * Include only those units that have samples or those that do not have samples.
     */
    hasSample?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Change response format to GeoJSON. To use this feature, you must aggregate by must contain two or four coordinate fields (lat,lon) or (latMin,latMax,lonMin,lonMax). The coordinate fields must be of the same type (wgs84,euref,ykj).
     */
    geoJSON?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'csv' | 'tsv';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Filter only those taxons that are finnish or are not finnish.
     */
    finnish?: boolean;

    /**
     * Include or exclude nulls to result. Will only check nullness of the first aggregateBy field.
     */
    excludeNulls?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter only occurrences reported to be at their breeding site.
     */
    breedingSite?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Filter based on habitat of taxa (primary or secondary). Will return entries of taxons that have one of the specified habitats or a subhabitat of the given habitats. Syntax: MKV.habitatMk[MKV.habitatSpecificTypeJ,MKV.habitatSpecificTypePAK] Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    anyHabitat?: string;

    /**
     * Include only those units/annotations that are of the selected annotation type. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    annotationType?: string;

    /**
     * Include only those annotations that have been made before or on the same date. Format is yyyy-MM-dd.
     */
    annotatedSameOrBefore?: string;

    /**
     * Include only those annotations that have been made after or on the same date. Format is yyyy-MM-dd.
     */
    annotatedSameOrAfter?: string;

    /**
     * Include only those units that have annotations or those that do not have annotations.
     */
    annotated?: boolean;

    /**
     * Define fields to aggregate by. Multiple values are seperated by ','.
     */
    aggregateBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.copyrightOwner' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'gathering.team.memberId' | 'gathering.team.memberName' | 'unit.abundanceString' | 'unit.annotationCount' | 'unit.annotations.annotationByPerson' | 'unit.annotations.annotationByPersonName' | 'unit.annotations.annotationBySystem' | 'unit.annotations.annotationBySystemName' | 'unit.annotations.annotationClass' | 'unit.annotations.created' | 'unit.annotations.id' | 'unit.annotations.invasiveControlEffectiveness' | 'unit.annotations.opinion' | 'unit.annotations.rootID' | 'unit.annotations.targetID' | 'unit.annotations.type' | 'unit.author' | 'unit.breedingSite' | 'unit.det' | 'unit.facts.decimalValue' | 'unit.facts.fact' | 'unit.facts.integerValue' | 'unit.facts.value' | 'unit.individualCountFemale' | 'unit.individualCountMale' | 'unit.individualId' | 'unit.interpretations.annotatedTaxonId' | 'unit.interpretations.individualCount' | 'unit.interpretations.pairCount' | 'unit.interpretations.unidentifiable' | 'unit.invasiveControlEffectiveness' | 'unit.invasiveControlled' | 'unit.keywords' | 'unit.lifeStage' | 'unit.linkings.originalTaxon.administrativeStatuses' | 'unit.linkings.originalTaxon.aggregateId' | 'unit.linkings.originalTaxon.anamorphId' | 'unit.linkings.originalTaxon.author' | 'unit.linkings.originalTaxon.birdlifeCode' | 'unit.linkings.originalTaxon.classId' | 'unit.linkings.originalTaxon.cultivarId' | 'unit.linkings.originalTaxon.cursiveName' | 'unit.linkings.originalTaxon.divisionId' | 'unit.linkings.originalTaxon.domainId' | 'unit.linkings.originalTaxon.ecotypeId' | 'unit.linkings.originalTaxon.euringCode' | 'unit.linkings.originalTaxon.euringNumber' | 'unit.linkings.originalTaxon.familyId' | 'unit.linkings.originalTaxon.finnish' | 'unit.linkings.originalTaxon.formId' | 'unit.linkings.originalTaxon.genusId' | 'unit.linkings.originalTaxon.groupId' | 'unit.linkings.originalTaxon.habitats' | 'unit.linkings.originalTaxon.hybridId' | 'unit.linkings.originalTaxon.id' | 'unit.linkings.originalTaxon.informalTaxonGroups' | 'unit.linkings.originalTaxon.infraclassId' | 'unit.linkings.originalTaxon.infradivisionId' | 'unit.linkings.originalTaxon.infragenericHybridId' | 'unit.linkings.originalTaxon.infragenericTaxonId' | 'unit.linkings.originalTaxon.infrakingdomId' | 'unit.linkings.originalTaxon.infraorderId' | 'unit.linkings.originalTaxon.infraphylumId' | 'unit.linkings.originalTaxon.infraspecificTaxonId' | 'unit.linkings.originalTaxon.intergenericHybridId' | 'unit.linkings.originalTaxon.invasive' | 'unit.linkings.originalTaxon.kingdomId' | 'unit.linkings.originalTaxon.nameAccordingTo' | 'unit.linkings.originalTaxon.nameEnglish' | 'unit.linkings.originalTaxon.nameFinnish' | 'unit.linkings.originalTaxon.nameSwedish' | 'unit.linkings.originalTaxon.nothogenusId' | 'unit.linkings.originalTaxon.nothospeciesId' | 'unit.linkings.originalTaxon.nothosubspeciesId' | 'unit.linkings.originalTaxon.orderId' | 'unit.linkings.originalTaxon.parentId' | 'unit.linkings.originalTaxon.parvclassId' | 'unit.linkings.originalTaxon.parvorderId' | 'unit.linkings.originalTaxon.phylumId' | 'unit.linkings.originalTaxon.populationGroupId' | 'unit.linkings.originalTaxon.primaryHabitat' | 'unit.linkings.originalTaxon.redListStatus' | 'unit.linkings.originalTaxon.scientificName' | 'unit.linkings.originalTaxon.scientificNameDisplayName' | 'unit.linkings.originalTaxon.sectionId' | 'unit.linkings.originalTaxon.seriesId' | 'unit.linkings.originalTaxon.species' | 'unit.linkings.originalTaxon.speciesAggregateId' | 'unit.linkings.originalTaxon.speciesId' | 'unit.linkings.originalTaxon.speciesNameEnglish' | 'unit.linkings.originalTaxon.speciesNameFinnish' | 'unit.linkings.originalTaxon.speciesNameSwedish' | 'unit.linkings.originalTaxon.speciesScientificName' | 'unit.linkings.originalTaxon.speciesTaxonomicOrder' | 'unit.linkings.originalTaxon.subclassId' | 'unit.linkings.originalTaxon.subdivisionId' | 'unit.linkings.originalTaxon.subfamilyId' | 'unit.linkings.originalTaxon.subformId' | 'unit.linkings.originalTaxon.subgenusId' | 'unit.linkings.originalTaxon.subkingdomId' | 'unit.linkings.originalTaxon.suborderId' | 'unit.linkings.originalTaxon.subphylumId' | 'unit.linkings.originalTaxon.subsectionId' | 'unit.linkings.originalTaxon.subseriesId' | 'unit.linkings.originalTaxon.subspeciesId' | 'unit.linkings.originalTaxon.subspecificAggregateId' | 'unit.linkings.originalTaxon.subtribeId' | 'unit.linkings.originalTaxon.subvarietyId' | 'unit.linkings.originalTaxon.superclassId' | 'unit.linkings.originalTaxon.superdivisionId' | 'unit.linkings.originalTaxon.superdomainId' | 'unit.linkings.originalTaxon.superfamilyId' | 'unit.linkings.originalTaxon.supergenusId' | 'unit.linkings.originalTaxon.superorderId' | 'unit.linkings.originalTaxon.superphylumId' | 'unit.linkings.originalTaxon.taxonRank' | 'unit.linkings.originalTaxon.taxonomicOrder' | 'unit.linkings.originalTaxon.tribeId' | 'unit.linkings.originalTaxon.typesOfOccurrenceInFinland' | 'unit.linkings.originalTaxon.varietyId' | 'unit.linkings.taxon.administrativeStatuses' | 'unit.linkings.taxon.aggregateId' | 'unit.linkings.taxon.anamorphId' | 'unit.linkings.taxon.author' | 'unit.linkings.taxon.birdlifeCode' | 'unit.linkings.taxon.classId' | 'unit.linkings.taxon.cultivarId' | 'unit.linkings.taxon.cursiveName' | 'unit.linkings.taxon.divisionId' | 'unit.linkings.taxon.domainId' | 'unit.linkings.taxon.ecotypeId' | 'unit.linkings.taxon.euringCode' | 'unit.linkings.taxon.euringNumber' | 'unit.linkings.taxon.familyId' | 'unit.linkings.taxon.finnish' | 'unit.linkings.taxon.formId' | 'unit.linkings.taxon.genusId' | 'unit.linkings.taxon.groupId' | 'unit.linkings.taxon.habitats' | 'unit.linkings.taxon.hybridId' | 'unit.linkings.taxon.id' | 'unit.linkings.taxon.informalTaxonGroups' | 'unit.linkings.taxon.infraclassId' | 'unit.linkings.taxon.infradivisionId' | 'unit.linkings.taxon.infragenericHybridId' | 'unit.linkings.taxon.infragenericTaxonId' | 'unit.linkings.taxon.infrakingdomId' | 'unit.linkings.taxon.infraorderId' | 'unit.linkings.taxon.infraphylumId' | 'unit.linkings.taxon.infraspecificTaxonId' | 'unit.linkings.taxon.intergenericHybridId' | 'unit.linkings.taxon.invasive' | 'unit.linkings.taxon.kingdomId' | 'unit.linkings.taxon.nameAccordingTo' | 'unit.linkings.taxon.nameEnglish' | 'unit.linkings.taxon.nameFinnish' | 'unit.linkings.taxon.nameSwedish' | 'unit.linkings.taxon.nothogenusId' | 'unit.linkings.taxon.nothospeciesId' | 'unit.linkings.taxon.nothosubspeciesId' | 'unit.linkings.taxon.orderId' | 'unit.linkings.taxon.parentId' | 'unit.linkings.taxon.parvclassId' | 'unit.linkings.taxon.parvorderId' | 'unit.linkings.taxon.phylumId' | 'unit.linkings.taxon.populationGroupId' | 'unit.linkings.taxon.primaryHabitat' | 'unit.linkings.taxon.redListStatus' | 'unit.linkings.taxon.scientificName' | 'unit.linkings.taxon.scientificNameDisplayName' | 'unit.linkings.taxon.sectionId' | 'unit.linkings.taxon.seriesId' | 'unit.linkings.taxon.species' | 'unit.linkings.taxon.speciesAggregateId' | 'unit.linkings.taxon.speciesId' | 'unit.linkings.taxon.speciesNameEnglish' | 'unit.linkings.taxon.speciesNameFinnish' | 'unit.linkings.taxon.speciesNameSwedish' | 'unit.linkings.taxon.speciesScientificName' | 'unit.linkings.taxon.speciesTaxonomicOrder' | 'unit.linkings.taxon.subclassId' | 'unit.linkings.taxon.subdivisionId' | 'unit.linkings.taxon.subfamilyId' | 'unit.linkings.taxon.subformId' | 'unit.linkings.taxon.subgenusId' | 'unit.linkings.taxon.subkingdomId' | 'unit.linkings.taxon.suborderId' | 'unit.linkings.taxon.subphylumId' | 'unit.linkings.taxon.subsectionId' | 'unit.linkings.taxon.subseriesId' | 'unit.linkings.taxon.subspeciesId' | 'unit.linkings.taxon.subspecificAggregateId' | 'unit.linkings.taxon.subtribeId' | 'unit.linkings.taxon.subvarietyId' | 'unit.linkings.taxon.superclassId' | 'unit.linkings.taxon.superdivisionId' | 'unit.linkings.taxon.superdomainId' | 'unit.linkings.taxon.superfamilyId' | 'unit.linkings.taxon.supergenusId' | 'unit.linkings.taxon.superorderId' | 'unit.linkings.taxon.superphylumId' | 'unit.linkings.taxon.taxonRank' | 'unit.linkings.taxon.taxonomicOrder' | 'unit.linkings.taxon.tribeId' | 'unit.linkings.taxon.typesOfOccurrenceInFinland' | 'unit.linkings.taxon.varietyId' | 'unit.media.author' | 'unit.media.copyrightOwner' | 'unit.media.licenseAbbreviation' | 'unit.media.licenseId' | 'unit.media.mediaType' | 'unit.mediaCount' | 'unit.quality.documentGatheringUnitQualityIssues' | 'unit.quality.issue.issue' | 'unit.quality.issue.source' | 'unit.quality.reliable' | 'unit.quality.taxon.reliability' | 'unit.quality.taxon.source' | 'unit.recordBasis' | 'unit.referencePublication' | 'unit.reportedInformalTaxonGroup' | 'unit.reportedTaxonConfidence' | 'unit.sampleCount' | 'unit.samples.collectionId' | 'unit.samples.facts.decimalValue' | 'unit.samples.facts.fact' | 'unit.samples.facts.integerValue' | 'unit.samples.facts.value' | 'unit.samples.keywords' | 'unit.samples.material' | 'unit.samples.multiple' | 'unit.samples.quality' | 'unit.samples.sampleId' | 'unit.samples.sampleOrder' | 'unit.samples.status' | 'unit.samples.type' | 'unit.sex' | 'unit.superRecordBasis' | 'unit.taxonVerbatim' | 'unit.typeSpecimen' | 'unit.unitId' | 'unit.unitOrder' | 'unit.wild'>;

    /**
     * NOTE: administrativeStatusId and redListStatusId filters form a mutual OR search. Filter based on URI or Qname identifier of an administrative status. Use Metadata-API to find identifiers. Will return entries of taxons that are marked with the admin status. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    administrativeStatusId?: string;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/csv' | 'application/tsv';
  }

  /**
   * Parameters for getWarehouseQueryGatheringAggregate
   */
  export interface GetWarehouseQueryGatheringAggregateParams {

    /**
     * Filter using uniform (YKJ) 50km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 50km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj50km?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 1km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj1km?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 10km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj10km?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s) that are resolved using center point of the area. Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100kmCenter?: string;

    /**
     * Filter using uniform (YKJ) 100km grid square(s). Valid format is lat:lon. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    ykj100km?: string;

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Filter using WGS84 centerpoint. Valid formats are lat:lon:WGS84 and latMin:latMax:lonMin:lonMax:WGS84. (You must include the type WGS84 even though it is the only supported type.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    wgs84CenterPoint?: string;

    /**
     * Filter using event date. Date can be a full date or part of a date, for example 2000, 2000-06 or 2000-06-25. Time can be a range, for example 2000/2005 or 2000-01-01/2005-12-31. Short forms for "last N days" can be used: 0 is today, -1 is yesterday and so on; for example -7/0 is a range between 7 days ago and today. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    time?: string;

    /**
     * Filter based on ids of verbatim observer name strings strings. (The only way to access these ids is to aggregate by gathering.team.memberId) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    teamMemberId?: string;

    /**
     * Filter based on verbatim observer names. Search is case insensitive and wildcard * can be used. Multiple values are seperated by ';'. When multiple values are given, this is an OR search.
     */
    teamMember?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Filter based on source of coordinates. Possible values are REPORTED_VALUE = the reported coordinates or FINNISH_MUNICIPALITY = the coordinates are the bounding box of the reported Finnish municipality (no coordinates were reported). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceOfCoordinates?: string;

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter using season. For example "501/630" gives all records for May and July and "1220/0220" between 20.12. - 20.2. If begin is ommited will use 1.1. and if end is ommited will use 31.12. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    season?: string;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Value of this parameter affects how oldestRecord and newestRecord are calculated regarding observations reported as date span. False (default): oldest=min(date.begin), newest=max(date.end). True: oldest=min(date.end), newest=max(date.begin).
     */
    pessimisticDateRangeHandling?: boolean;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to count (desc) and each aggregate by field (asc). Each fieldname given as parameter defaults to ASC - if you want to sort using descending order, add " DESC" to the end of the field name. In addition to aggregateBy fields you can use the following aggregate function names: [count, oldestRecord, newestRecord, lineLengthSum, firstLoadDateMin, firstLoadDateMax]. Multiple values are seperated by ','.
     */
    orderBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.copyrightOwner' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'gathering.team.memberId' | 'gathering.team.memberName' | 'count' | 'oldestRecord' | 'newestRecord' | 'lineLengthSum' | 'firstLoadDateMin' | 'firstLoadDateMax'>;

    /**
     * Return only count of rows (default) or also additional aggregate function values.
     */
    onlyCount?: boolean;

    /**
     * Your own observations search. You have been marked as the observer in the record. Get records using the observerId of the person to whom the token belongs to. These come from the private warehouse!
     */
    observerPersonToken?: string;

    /**
     * Filter based on observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    observerId?: string;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent gathering has media or doesn't have media.
     */
    hasGatheringMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Change response format to GeoJSON. To use this feature, you must aggregate by must contain two or four coordinate fields (lat,lon) or (latMin,latMax,lonMin,lonMax). The coordinate fields must be of the same type (wgs84,euref,ykj).
     */
    geoJSON?: boolean;

    /**
     * Filter using gathering URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    gatheringId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    gatheringFact?: string;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'csv' | 'tsv';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Filter based on URI or Qname identifier of a finnish municipality. Use Area-API to find identifiers. Will return entries where we have been able to interpret the municipality from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    finnishMunicipalityId?: string;

    /**
     * Include or exclude nulls to result. Will only check nullness of the first aggregateBy field.
     */
    excludeNulls?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Your saved records or own observations search (OR search). These come from the private warehouse!
     */
    editorOrObserverPersonToken?: string;

    /**
     * Filter based on "owners" or observers of records. Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorOrObserverId?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Filter using day of year. For example "100/160" gives all records during spring and "330/30" during mid winter. If begin is ommited will use day 1 and if end is ommited will use day 366. Multiple ranges can be given by providing the parameter more times. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    dayOfYear?: string;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter using coordinates. Valid formats are latMin:latMax:lonMin:lonMax:system:ratio and lat:lon:system:ratio. The last parameter (ratio) is not required. Valid systems are WGS84, YKJ and EUREF. For metric coordinates (ykj, euref): the search 666:333:YKJ means lat between 6660000-6670000 and lon between 3330000-3340000. Ratio is a number between 0.0-1.0. Default ratio is 1.0 (observation area must be entirely inside the search area). Ratio 0.0: the search area must intersect with the observation area. For WGS84 the ratio is not calculated in meters but in degrees so it an approximation. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    coordinates?: string;

    /**
     * Exclude coordinates that are less accurate or equal than the provided value (inclusive). Value is meters. Accuracy is a guiding logaritmic figure, for example 1m, 10m, 100m or 100km. (More specifically the longest length of the area bouding box rounded up on the logarithmic scale.)
     */
    coordinateAccuracyMax?: number;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Filter based on URI or Qname identifier of a biogeographical province. Use Area-API to find identifiers. Will return entries where we have been able to interpret the province from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    biogeographicalProvinceId?: string;

    /**
     * Filter using name of country, municipality, province or locality. If the given name matches exactly one known area, the search will perform and identifier search. Otherwise the search looks from from country verbatim, municipality verbatim, province verbatim and locality using exact match case insensitive search. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    area?: string;

    /**
     * Define fields to aggregate by. Multiple values are seperated by ','.
     */
    aggregateBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'gathering.biogeographicalProvince' | 'gathering.conversions.boundingBoxAreaInSquareMeters' | 'gathering.conversions.century' | 'gathering.conversions.day' | 'gathering.conversions.dayOfYearBegin' | 'gathering.conversions.dayOfYearEnd' | 'gathering.conversions.decade' | 'gathering.conversions.euref.latMax' | 'gathering.conversions.euref.latMin' | 'gathering.conversions.euref.lonMax' | 'gathering.conversions.euref.lonMin' | 'gathering.conversions.eurefWKT' | 'gathering.conversions.linelengthInMeters' | 'gathering.conversions.month' | 'gathering.conversions.seasonBegin' | 'gathering.conversions.seasonEnd' | 'gathering.conversions.wgs84.latMax' | 'gathering.conversions.wgs84.latMin' | 'gathering.conversions.wgs84.lonMax' | 'gathering.conversions.wgs84.lonMin' | 'gathering.conversions.wgs84CenterPoint.lat' | 'gathering.conversions.wgs84CenterPoint.lon' | 'gathering.conversions.wgs84Grid005.lat' | 'gathering.conversions.wgs84Grid005.lon' | 'gathering.conversions.wgs84Grid01.lat' | 'gathering.conversions.wgs84Grid01.lon' | 'gathering.conversions.wgs84Grid05.lat' | 'gathering.conversions.wgs84Grid05.lon' | 'gathering.conversions.wgs84Grid1.lat' | 'gathering.conversions.wgs84Grid1.lon' | 'gathering.conversions.wgs84WKT' | 'gathering.conversions.year' | 'gathering.conversions.ykj.latMax' | 'gathering.conversions.ykj.latMin' | 'gathering.conversions.ykj.lonMax' | 'gathering.conversions.ykj.lonMin' | 'gathering.conversions.ykj100km.lat' | 'gathering.conversions.ykj100km.lon' | 'gathering.conversions.ykj100kmCenter.lat' | 'gathering.conversions.ykj100kmCenter.lon' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'gathering.conversions.ykj1km.lat' | 'gathering.conversions.ykj1km.lon' | 'gathering.conversions.ykj1kmCenter.lat' | 'gathering.conversions.ykj1kmCenter.lon' | 'gathering.conversions.ykj50km.lat' | 'gathering.conversions.ykj50km.lon' | 'gathering.conversions.ykj50kmCenter.lat' | 'gathering.conversions.ykj50kmCenter.lon' | 'gathering.conversions.ykjWKT' | 'gathering.coordinatesVerbatim' | 'gathering.country' | 'gathering.displayDateTime' | 'gathering.eventDate.begin' | 'gathering.eventDate.end' | 'gathering.facts.decimalValue' | 'gathering.facts.fact' | 'gathering.facts.integerValue' | 'gathering.facts.value' | 'gathering.gatheringId' | 'gathering.gatheringOrder' | 'gathering.higherGeography' | 'gathering.hourBegin' | 'gathering.hourEnd' | 'gathering.interpretations.biogeographicalProvince' | 'gathering.interpretations.biogeographicalProvinceDisplayname' | 'gathering.interpretations.coordinateAccuracy' | 'gathering.interpretations.country' | 'gathering.interpretations.countryDisplayname' | 'gathering.interpretations.finnishMunicipality' | 'gathering.interpretations.municipalityDisplayname' | 'gathering.interpretations.sourceOfBiogeographicalProvince' | 'gathering.interpretations.sourceOfCoordinates' | 'gathering.interpretations.sourceOfCountry' | 'gathering.interpretations.sourceOfFinnishMunicipality' | 'gathering.linkings.observers' | 'gathering.locality' | 'gathering.media.author' | 'gathering.media.copyrightOwner' | 'gathering.media.licenseAbbreviation' | 'gathering.media.licenseId' | 'gathering.media.mediaType' | 'gathering.mediaCount' | 'gathering.minutesBegin' | 'gathering.minutesEnd' | 'gathering.municipality' | 'gathering.observerUserIds' | 'gathering.province' | 'gathering.quality.issue.issue' | 'gathering.quality.issue.source' | 'gathering.quality.locationIssue.issue' | 'gathering.quality.locationIssue.source' | 'gathering.quality.timeIssue.issue' | 'gathering.quality.timeIssue.source' | 'gathering.taxonCensus.taxonId' | 'gathering.taxonCensus.type' | 'gathering.team' | 'gathering.team.memberId' | 'gathering.team.memberName'>;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/csv' | 'application/tsv';
  }

  /**
   * Parameters for getWarehouseQueryGatheringStatistics
   */
  export interface GetWarehouseQueryGatheringStatisticsParams {

    /**
     * Filter using event date. Value can be a year (2000), year range (2000/2001), year-month (2000-06) or a year-month range (2000-06/2000-08). (Note: this filter is mostly aimed to be used in /statistics queries because 'time' filter is not available for /statistics queries.) Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    yearMonth?: string;

    /**
     * Show only records where observations are completely recorded for this higher taxon or taxa. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    taxonCensus?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Value of this parameter affects how oldestRecord and newestRecord are calculated regarding observations reported as date span. False (default): oldest=min(date.begin), newest=max(date.end). True: oldest=min(date.end), newest=max(date.begin).
     */
    pessimisticDateRangeHandling?: boolean;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to count (desc) and each aggregate by field (asc). Each fieldname given as parameter defaults to ASC - if you want to sort using descending order, add " DESC" to the end of the field name. In addition to aggregateBy fields you can use the following aggregate function names: [count, oldestRecord, newestRecord, lineLengthSum, firstLoadDateMin, firstLoadDateMax]. Multiple values are seperated by ','.
     */
    orderBy?: Array<'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'gathering.conversions.month' | 'gathering.conversions.year' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon' | 'count' | 'oldestRecord' | 'newestRecord' | 'lineLengthSum' | 'firstLoadDateMin' | 'firstLoadDateMax'>;

    /**
     * Return only count of rows (default) or also additional aggregate function values.
     */
    onlyCount?: boolean;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'csv' | 'tsv';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Include or exclude nulls to result. Will only check nullness of the first aggregateBy field.
     */
    excludeNulls?: boolean;

    /**
     * Filter based on URI or Qname identifier of a country. Use Area-API to find identifiers. Will return entries where we have been able to interpret the country from coordinates or from reported area name. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    countryId?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Define fields to aggregate by. Multiple values are seperated by ','.
     */
    aggregateBy?: Array<'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'gathering.conversions.month' | 'gathering.conversions.year' | 'gathering.conversions.ykj10km.lat' | 'gathering.conversions.ykj10km.lon' | 'gathering.conversions.ykj10kmCenter.lat' | 'gathering.conversions.ykj10kmCenter.lon'>;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/csv' | 'application/tsv';
  }

  /**
   * Parameters for getWarehouseQueryDocumentAggregate
   */
  export interface GetWarehouseQueryDocumentAggregateParams {

    /**
     * Filter using identifiers of data sources (information systems). Use InformationSystem-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    sourceId?: string;

    /**
     * Include only those that are secured or those that are not secured.
     */
    secured?: boolean;

    /**
     * Filter based on secure reasons. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureReason?: string;

    /**
     * Filter based on secure level. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    secureLevel?: string;

    /**
     * Filter based on quality rating of collections. Quality rating ranges from 1 (lower quality) to 5 (high quality). To get a range (for example 4-5), provide the value several times (for example 4,5). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    reliabilityOfCollection?: string;

    /**
     * Possible values: NO_ISSUES, BOTH, ONLY_ISSUES. Include records with quality issues (document, gathering or unit issues). Default is NO_ISSUES, but when searching by id (documentId, unitId, keyword) or using annotation endpoint the default is BOTH.
     */
    qualityIssues?: string;

    /**
     * Value of this parameter affects how oldestRecord and newestRecord are calculated regarding observations reported as date span. False (default): oldest=min(date.begin), newest=max(date.end). True: oldest=min(date.end), newest=max(date.begin).
     */
    pessimisticDateRangeHandling?: boolean;

    /**
     * Set number of results in one page.
     */
    pageSize?: number;

    /**
     * Set current page.
     */
    page?: number;

    /**
     * Define what fields to use when sorting results. Defaults to count (desc) and each aggregate by field (asc). Each fieldname given as parameter defaults to ASC - if you want to sort using descending order, add " DESC" to the end of the field name. In addition to aggregateBy fields you can use the following aggregate function names: [count, firstLoadDateMin, firstLoadDateMax]. Multiple values are seperated by ','.
     */
    orderBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId' | 'count' | 'firstLoadDateMin' | 'firstLoadDateMax'>;

    /**
     * Return only count of rows (default) or also additional aggregate function values.
     */
    onlyCount?: boolean;

    /**
     * Filter based on URI or Qname identifier of a NamedPlace. Use NamedPlace-API to find identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    namedPlaceId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded before or on the same date.
     */
    loadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse. Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    loadedSameOrAfter?: string;

    /**
     * Filter using keywords that have been tagged to entries. There are many types of keywods varying from legacy identifiers, project names and IDs, dataset ids, etc.  Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    keyword?: string;

    /**
     * Defines if collectionId filter should include sub collections of the given collection ids. By default sub collections are included.
     */
    includeSubCollections?: boolean;

    /**
     * Filter only units where parent document, gathering or unit has media or none have media.
     */
    hasMedia?: boolean;

    /**
     * Filter only units where parent document has media or doesn't have media.
     */
    hasDocumentMedia?: boolean;

    /**
     * Alternative way to define content type of the response. If unknown, returns an error.
     */
    format?: 'json' | 'xml' | 'csv' | 'tsv';

    /**
     * Filter based on URI or Qname identifier of a Form. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    formId?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. RReturns entries loaded before or on the same date.
     */
    firstLoadedSameOrBefore?: string;

    /**
     * Filter using the date data was loaded to Data Warehouse (first load of document). Format is yyyy-MM-dd. Returns entries loaded later or on the same date.
     */
    firstLoadedSameOrAfter?: string;

    /**
     * Include or exclude nulls to result. Will only check nullness of the first aggregateBy field.
     */
    excludeNulls?: boolean;

    /**
     * Saved records search. You have saved or modified the records. Get records using the editorId of the person to whom the token belongs to. These come from the private warehouse!
     */
    editorPersonToken?: string;

    /**
     * Filter based on "owners" of records (those who have edit permissions or have edited, modified). Only available in private-query-API. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    editorId?: string;

    /**
     * Filter using document URIs. Will include records with quality issues. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    documentId?: string;

    /**
     * Format is "factName=value;otherFact=value". If value is not given (for example just "factName"), this filter matches all records that have the given fact. If value is a numeric range (for example "factName=-5.0/-1.5"), this filter matches all values where the value is between the range (inclusive). When multiple fact names are given, this is an AND search. For facts that are URIs, you can use full URI or Qname.
     */
    documentFact?: string;

    /**
     * Exclude certain collections. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionIdNot?: string;

    /**
     * Filter based on URI or Qname identifier of collections. Use Collections-API to resolve identifiers. Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    collectionId?: string;

    /**
     * Use cache for this query. Defaults to false. Cache duration is 60 seconds.
     */
    cache?: boolean;

    /**
     * Filter based on URI or Qname identifier of a BirdAssociationArea. Use NamedPlace-API/Area-API to find identifiers. Only works for documents that have a NamedPlace that is associated to a bird area. (Will not work for random observations). Multiple values are seperated by ','. When multiple values are given, this is an OR search.
     */
    birdAssociationAreaId?: string;

    /**
     * Define fields to aggregate by. Multiple values are seperated by ','.
     */
    aggregateBy?: Array<'document.collectionId' | 'document.conservationReasonSecured' | 'document.createdDate' | 'document.customReasonSecured' | 'document.dataQuarantinePeriodReasonSecured' | 'document.documentId' | 'document.editorUserIds' | 'document.facts.decimalValue' | 'document.facts.fact' | 'document.facts.integerValue' | 'document.facts.value' | 'document.firstLoadDate' | 'document.formId' | 'document.keywords' | 'document.licenseId' | 'document.linkings.editors' | 'document.loadDate' | 'document.media.author' | 'document.media.copyrightOwner' | 'document.media.licenseAbbreviation' | 'document.media.licenseId' | 'document.media.mediaType' | 'document.mediaCount' | 'document.modifiedDate' | 'document.namedPlace.birdAssociationAreaDisplayName' | 'document.namedPlace.birdAssociationAreaId' | 'document.namedPlace.collectionId' | 'document.namedPlace.id' | 'document.namedPlace.municipalityDisplayName' | 'document.namedPlace.municipalityId' | 'document.namedPlace.name' | 'document.namedPlace.ykj10km.lat' | 'document.namedPlace.ykj10km.lon' | 'document.namedPlaceId' | 'document.quality.issue.issue' | 'document.quality.issue.source' | 'document.quality.reliabilityOfCollection' | 'document.secureLevel' | 'document.secureReasons' | 'document.secured' | 'document.sourceId'>;

    /**
     * Content type of the response. If unknown, returns default format: JSON
     */
    accept?: 'application/json' | 'application/xml' | 'application/csv' | 'application/tsv';
  }

}


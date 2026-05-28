import { Inject, Injectable, InjectionToken } from '@angular/core';
import { paths } from 'projects/laji-api-client/generated/api.d';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { share, tap } from 'rxjs';

type WithResponses<T> = T & { responses: unknown };

type ResponseType = 'json' | 'text' | 'arraybuffer' | 'blob';

interface HttpClientOptions<RT extends ResponseType | undefined> {
  responseType?: RT;
};

type Parameters<T, RT extends ResponseType | undefined> =
  'parameters' extends keyof T
    ? T['parameters'] & HttpClientOptions<RT>
    : HttpClientOptions<RT>;

interface ResponseTypeToContentTypes {
  json: 'application/json';
  text: 'text/plain' | 'text/csv' | 'application/xml' | 'text/tab-separated-values';
  blob: 'application/pdf';
  arraybuffer: never;
};

type BinaryContent<T> =
  T extends string ? Blob : T;

type ExtractContentByResponseType<
  R,
  RT extends ResponseType | undefined
> =
  R extends { content: infer C extends Record<string, any> }
    ? RT extends undefined | 'json'
      ? C extends { 'application/json': infer J }
        ? J
        : never
      : RT extends 'text'
        ? C[Extract<keyof C, ResponseTypeToContentTypes['text']>]
        : RT extends 'blob'
          ? BinaryContent<
              C[Extract<keyof C, ResponseTypeToContentTypes['blob']>]
            >
          : never
    : null;

type ExtractRequestContentIfExists<R> =
  R extends { requestBody: { content: infer C } } | { requestBody?: { content: infer C } }
    ? C
    : never;
type ExtractRequestBodyIfExists<R> =
  R extends { requestBody: { content: infer C } } | { requestBody?: { content: infer C } }
    ? C[keyof C]
    : never;
type RequestBodyFor<R> =
  ExtractRequestBodyIfExists<R> |
  ('multipart/form-data' extends keyof ExtractRequestContentIfExists<R> ? FormData : never);
type HttpSuccessCodes = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
type IntersectUnionTypes<A, B> = A extends B ? A : never;

type Path = keyof paths & string;
type PathWithMethod<M extends string> =
  keyof { [P in keyof paths as paths[P] extends Record<M, any> ? P : never]: paths[P] };

type Method<P extends Path> = Exclude<
  keyof { [K in keyof paths[P] as paths[P][K] extends undefined | never ? never : K]: paths[P][K] }
, 'parameters'>;
type Responses<P extends Path, M extends Method<P>> = WithResponses<paths[P][M]>['responses'];

interface CachedValueNotStarted { _tag: 'not-started' };
interface CachedValueLoading<T> { obs: Observable<T>; _tag: 'loading' };
interface CachedValueCompleted<T> { val: T; lastRefresh: number; _tag: 'completed' };

type CacheElement<T> = CachedValueNotStarted | CachedValueLoading<T> | CachedValueCompleted<T>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface Options {
  cacheInvalidationMs?: number;
  /** Defaults to true */
  langFallback?: boolean;
};

const ONE_DAY = 86400000;

const sortRecordRecursively = (record: Record<string, unknown> = {}): Record<string, unknown> => (
  Object.entries(record)
    .sort(([aKey, aVal], [bKey, bVal]) => aKey > bKey ? 1 : aKey < bKey ? -1 : 0)
    .reduce((acc, [key, value]) => {
      acc[key] = isRecord(value) ? sortRecordRecursively(value) : value;
      return acc;
    }, Object.create(null))
);

const hashRecord = (record: any): string => JSON.stringify(sortRecordRecursively(record));

const splitAndResolvePath = <
  P extends Path,
  M extends Method<P>,
  RT extends ResponseType | undefined
>(path: P, params?: Parameters<paths[P][M], RT>): string[] => {
  // parse path into segments based on path parameters
  // eg. "/person/{personToken}/profile" -> ["/person", "/{personToken}", "/profile"]
  const segments = path.split(/(\/\{[^}]+\})/).filter(Boolean);

  if (!params) {
    return segments;
  }

  // resolve path parameters (eg. replace '/{personToken}' with params.path.personToken)
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    segments[i] = segment.replace(/\{([^}]+)\}/, (match, p1) => (params as any)['path'][p1] ?? '');
  }

  return segments;
};

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
  providedIn: 'root'
})
export class LajiApiClientService {
  // variable level cache
  // first levels are for different path segments separated by path variables
  // the last level is for query params
  private cache: Map<string, any> = new Map();
  private lang = 'en';
  private personToken?: string;

  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) {}

  setLang(lang: string) {
    this.lang = lang;
  }

  setPersonToken(personToken?: string) {
    this.personToken = personToken;
  }

  get<
    P extends PathWithMethod<'get'>,
    R extends Responses<P,
    'get' extends Method<P> ? 'get' : never>,
    RT extends ResponseType | undefined = undefined
>(
    path: P,
    params?: Parameters<paths[P]['get'], RT>,
    options?: Options
  ): Observable<
    ExtractContentByResponseType<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>],
    RT>
> {
    return this.fetch(
      path,
      'get' as any,
      params as any,
      undefined,
      options
    );
  }

  put<
    P extends PathWithMethod<'put'>,
    R extends Responses<P, 'put' extends Method<P> ? 'put' : never>,
    RT extends ResponseType | undefined = undefined
>(
    path: P,
    params?: Parameters<paths[P]['put'], RT>,
    requestBody?: RequestBodyFor<paths[P]['put']>,
    options?: Options
  ): Observable<
ExtractContentByResponseType<
    R[IntersectUnionTypes<keyof R, HttpSuccessCodes>],
    Parameters<paths[P]['put'], RT>['responseType']
  >
> {
    return this.fetch(
      path,
      'put' as any,
      params as any,
      requestBody as any,
      options
    );
  }

  post<
    P extends PathWithMethod<'post'>,
    R extends Responses<P, 'post' extends Method<P> ? 'post' : never>,
    RT extends ResponseType | undefined = undefined
>(
    path: P,
    params?: Parameters<paths[P]['post'], RT>,
    requestBody?: RequestBodyFor<paths[P]['post']>,
    options?: Options
  ): Observable<
ExtractContentByResponseType<
    R[IntersectUnionTypes<keyof R, HttpSuccessCodes>],
    Parameters<paths[P]['post'], RT>['responseType']
  >
> {
    return this.fetch(
      path,
      'post' as any,
      params as any,
      requestBody as any,
      options
    );
  }

  delete<
    P extends PathWithMethod<'delete'>,
    R extends Responses<P, 'delete' extends Method<P> ? 'delete' : never>,
    RT extends ResponseType | undefined = undefined
>(
    path: P,
    params?: Parameters<paths[P]['delete'], RT>,
    options?: Options
  ): Observable<
ExtractContentByResponseType<
    R[IntersectUnionTypes<keyof R, HttpSuccessCodes>],
    Parameters<paths[P]['delete'], RT>['responseType']
  >
> {
    return this.fetch(
      path,
      'delete' as any,
      params as any,
      undefined,
      options
    );
  }

  protected getHeaders(lang: string, langFallback = true, personToken?: string) {
    const headers: Record<string, string> = {
			'API-Version': '1',
			'Accept-Language': lang,
		};
    if (!langFallback) {
      headers['Accept-Language'] = `${headers['Accept-Language']},*;q=0`;
    }
    if (personToken) {
      headers['Person-Token'] = personToken;
    }
    return headers;
  }

  private getRequestOptions(
    queryParams: any,
    requestBody: any,
    lang: string,
    langFallback = true,
    personToken?: string,
    responseType: ResponseType = 'json'
  ) {
    const params = Object.keys((queryParams || {})).reduce((filteredQueryParams, key) => {
      const param = (queryParams || {})[key];
      if (param === undefined) {
        return filteredQueryParams;
      }
      filteredQueryParams[key] = queryParams[key];
      return filteredQueryParams;
    }, {} as any);

    const headers = this.getHeaders(lang, langFallback, personToken);
    return { params, body: requestBody, headers, responseType };
  }

  fetch<
    P extends Path,
    M extends Method<P>,
    R extends Responses<P, M>,
    RT extends ResponseType | undefined = undefined
>(
    path: P,
    method: M,
    params?: Parameters<paths[P][M], RT>,
    requestBody?: RequestBodyFor<paths[P][M]>,
    { cacheInvalidationMs = ONE_DAY, langFallback = true }: Options = {}
  ): Observable<
ExtractContentByResponseType<
    R[IntersectUnionTypes<keyof R, HttpSuccessCodes>],
    Parameters<paths[P][M], RT>['responseType']
  >
> {
    const pathSegments = splitAndResolvePath(path, params);
    const requestUrl = this.baseUrl + pathSegments.join('');

    if (method !== 'get') {
      this._flush(pathSegments);
      return this.http.request(
        method as string,
        requestUrl,
        this.getRequestOptions((params as any)?.query, requestBody, this.lang, langFallback, this.personToken, params?.responseType)
      ) as any;
    }

    const cachedPath = this.getOrInitializeLastPathCacheLevel(pathSegments);

    const paramsHash = hashRecord({ ...params || {}, langFallback });
    if (!cachedPath?.has(paramsHash)) {
      cachedPath?.set(paramsHash, { _tag: 'not-started' });
    }

    const cachedParams = cachedPath?.get(paramsHash);

    if (cachedParams !== undefined && cachedParams._tag !== 'not-started') {
      if (cachedParams._tag === 'completed' && Date.now() - cachedParams.lastRefresh < cacheInvalidationMs) {
        return of(cachedParams.val);
      }
      if (cachedParams._tag === 'loading') {
        return cachedParams.obs;
      }
    }

    const obs = this.http.request(
      method,
      requestUrl,
      this.getRequestOptions((params as any)?.query, requestBody, this.lang, langFallback, this.personToken, params?.responseType)
    ).pipe(
      tap(val => {
        cachedPath?.set(paramsHash, {
          _tag :'completed',
          val,
          lastRefresh: Date.now()
        });
      }),
      share()
    ) as any;

    cachedPath?.set(paramsHash, {
      _tag: 'loading', obs
    });

    return obs as any;
  }

  flush<P extends Path, M extends Method<P>>(
    path: P,
    params?: Parameters<paths[P][M], never>
  ) {
    this._flush(splitAndResolvePath(path, params), params);
  }

  private _flush<P extends Path, M extends Method<P>>(
    pathSegments: string[],
    params?: Parameters<paths[P][M], never>
  ) {
    while (pathSegments.length) {
      const cachedPath = this.pathSegmentsToCacheLevels(pathSegments);
      if (cachedPath === null) {
        pathSegments.pop();
        params = undefined;
        continue;
      }

      if (params !== undefined) {
        const paramsHash = hashRecord(params);
        cachedPath[cachedPath.length - 1].delete(paramsHash);
      } else {
        cachedPath[cachedPath.length - 2].delete(pathSegments[pathSegments.length - 1]);
      }
      break;
    }
  }

  private getOrInitializeLastPathCacheLevel(pathSegments: string[]): Map<string, CacheElement<any>> {
    let currentLevel = this.cache;
    for (const segment of pathSegments) {
      if (!(currentLevel.has(segment))) {
        currentLevel.set(segment, new Map());
      }
      currentLevel = currentLevel.get(segment);
    }
    return currentLevel;
  }

  private pathSegmentsToCacheLevels(pathSegments: string[]): Map<string, any>[] | null {
    const allLevels: Map<string, any>[] = [this.cache];
    let currentLevel = this.cache;
    for (const segment of pathSegments) {
      if (!(currentLevel.has(segment))) {
        return null;
      }
      currentLevel = currentLevel.get(segment);
      allLevels.push(currentLevel);
    }
    return allLevels;
  }
}

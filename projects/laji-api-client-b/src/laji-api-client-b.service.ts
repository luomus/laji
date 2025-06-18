import { Inject, Injectable, InjectionToken } from '@angular/core';
import { paths } from 'projects/laji-api-client-b/generated/api.d';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

type WithResponses<T> = T & { responses: unknown };
type Parameters<T> = 'parameters' extends keyof T ? T['parameters'] : never;
type ExtractContentIfExists<R> = R extends { content: infer C } ? C[keyof C] : null;
type ExtractRequestBodyIfExists<R> =
  R extends { requestBody: { content: infer C } } | { requestBody?: { content: infer C } }
    ? C[keyof C]
    : never;
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

const ONE_DAY = 86400000;

const sortRecordRecursively = (record: Record<string, unknown>): Record<string, unknown> => (
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
>(path: P, params?: Parameters<paths[P][M]>): string[] => {
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
export class LajiApiClientBService {
  // variable level cache
  // first levels are for different path segments separated by path variables
  // the last level is for query params
  private cache: Map<string, any> = new Map();

  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) { }

  get<P extends PathWithMethod<'get'>, R extends Responses<P, 'get' extends Method<P> ? 'get' : never>>(
    path: P,
    params?: Parameters<paths[P]['get']>,
    cacheInvalidationMs = ONE_DAY
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'get' as any, params as any, undefined, cacheInvalidationMs);
  }

  put<P extends PathWithMethod<'put'>, R extends Responses<P, 'put' extends Method<P> ? 'put' : never>>(
    path: P,
    params?: Parameters<paths[P]['put']>,
    requestBody?: ExtractRequestBodyIfExists<paths[P]['put']>,
    cacheInvalidationMs = ONE_DAY
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'put' as any, params as any, requestBody, cacheInvalidationMs);
  }

  post<P extends PathWithMethod<'post'>, R extends Responses<P, 'post' extends Method<P> ? 'post' : never>>(
    path: P,
    params?: Parameters<paths[P]['post']>,
    requestBody?: ExtractRequestBodyIfExists<paths[P]['post']>,
    cacheInvalidationMs = ONE_DAY
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'post' as any, params as any, requestBody, cacheInvalidationMs);
  }

  delete<P extends PathWithMethod<'delete'>, R extends Responses<P, 'delete' extends Method<P> ? 'delete' : never>>(
    path: P,
    params?: Parameters<paths[P]['delete']>,
    cacheInvalidationMs = ONE_DAY
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'delete' as any, params as any, undefined, cacheInvalidationMs);
  }

  fetch<P extends Path, M extends Method<P>, R extends Responses<P, M>>(
    path: P,
    method: M,
    params?: Parameters<paths[P][M]>,
    requestBody?: ExtractRequestBodyIfExists<paths[P][M]>,
    cacheInvalidationMs = ONE_DAY
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    const pathSegments = splitAndResolvePath(path, params);
    const requestUrl = this.baseUrl + pathSegments.join('');
    const requestOptions = { params: (<any>params).query, body: requestBody, headers: { 'API-Version': '1' } };

    if (method !== 'get') {
      this._flush(pathSegments);
      return this.http.request(method as string, requestUrl, requestOptions) as any;
    }

    const cachedPath = this.getOrInitializeLastPathCacheLevel(pathSegments);

    const paramsHash = hashRecord(params);
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

    const obs = this.http.request(method, requestUrl, requestOptions).pipe(
      tap(val => {
        cachedPath?.set(paramsHash, {
          _tag :'completed',
          val,
          lastRefresh: Date.now()
        });
      }),
      shareReplay(1)
    ) as any;

    cachedPath?.set(paramsHash, {
      _tag: 'loading', obs
    });

    return obs;
  }

  flush<P extends Path, M extends Method<P>>(
    path: P,
    params?: Parameters<paths[P][M]>
  ) {
    this._flush(splitAndResolvePath(path, params), params);
  }

  private _flush<P extends Path, M extends Method<P>>(
    pathSegments: string[],
    params?: Parameters<paths[P][M]>
  ) {
    const cachedPath = this.pathSegmentsToCacheLevels(pathSegments);
    if (cachedPath === null) {
      return;
    }

    if (params !== undefined) {
      const paramsHash = hashRecord(params);
      cachedPath[cachedPath.length - 1].delete(paramsHash);
    } else {
      cachedPath[cachedPath.length - 2].delete(pathSegments[pathSegments.length - 1]);
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


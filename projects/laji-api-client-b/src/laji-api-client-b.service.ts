import { Inject, Injectable, InjectionToken } from '@angular/core';
import { paths } from 'projects/laji-api-client-b/generated/api.d';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';

type WithResponses<T> = T & { responses: unknown };
type Parameters<T> = 'parameters' extends keyof T ? T['parameters'] : undefined;
type ExtractContentIfExists<R> = R extends { content: { 'application/json': infer C } } ? C : null;
type ExtractRequestBodyIfExists<R> = R extends { requestBody: { content: { 'application/json': infer C } } } ? C : never;
type HttpSuccessCodes = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
type IntersectUnionTypes<A, B> = A extends B ? A : never;
type OptionalKeys<T, K extends string> = Omit<T, K> & Partial<Pick<T, Extract<K, keyof T>>>;

type WithOptionalQuery<T, Q> = Q extends Record<string, never>
	? T | (T & { query: Q })
		: T & { query: Q };
type ParametersWithOptionalQueryKeys<T, K extends string> =
	T extends { parameters: infer P }
		? P extends { query: infer Q }
			? WithOptionalQuery<Omit<P, 'query'>, OptionalKeys<Q, K>>
			: P
	: undefined;

type Path = keyof paths & string;
type Method = 'get' | 'post' | 'put' | 'delete';
type Responses<P extends Path, M extends Method> = WithResponses<paths[P][M]>['responses'];

interface CachedValueNotStarted { _tag: 'not-started' };
interface CachedValueLoading<T> { obs: Observable<T>; _tag: 'loading' };
interface CachedValueCompleted<T> { val: T; lastRefresh: number; _tag: 'completed' };

type CacheElement<T> = CachedValueNotStarted | CachedValueLoading<T> | CachedValueCompleted<T>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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
  M extends Method,
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

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string,
    private translate: TranslateService,
    private userService: UserService
  ) { }

  /** `personToken` and `lang` are populated automatically into the query */
  get<P extends Path, R extends Responses<P, 'get'>>(
    path: P,
    params: ParametersWithOptionalQueryKeys<paths[P]['get'], 'personToken' | 'lang'>,
    cacheInvalidationMs?: number
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'get', params, undefined, cacheInvalidationMs);
  }

  /** `personToken` and `lang` are populated automatically into the query */
  put<P extends Path, R extends Responses<P, 'put'>>(
    path: P,
    params: ParametersWithOptionalQueryKeys<paths[P]['put'], 'personToken' | 'lang'>,
    body?: ExtractRequestBodyIfExists<paths[P]['put']>,
    cacheInvalidationMs?: number
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'put', params, body, cacheInvalidationMs);
  }

  /** `personToken` and `lang` are populated automatically into the query */
  post<P extends Path, R extends Responses<P, 'post'>>(
    path: P,
    params: ParametersWithOptionalQueryKeys<paths[P]['post'], 'personToken' | 'lang'>,
    body?: ExtractRequestBodyIfExists<paths[P]['post']>,
    cacheInvalidationMs?: number
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'post', params, body, cacheInvalidationMs);
  }

  /** `personToken` and `lang` are populated automatically into the query */
  delete<P extends Path, R extends Responses<P, 'delete'>>(
    path: P,
    params: ParametersWithOptionalQueryKeys<paths[P]['delete'], 'personToken' | 'lang'>,
    cacheInvalidationMs?: number
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    return this.fetch(path, 'delete', params, undefined, cacheInvalidationMs);
  }

  private fetch<P extends Path, M extends Method, R extends Responses<P, M>>(
    path: P,
    method: M,
    params: ParametersWithOptionalQueryKeys<paths[P][M], 'personToken' | 'lang'>,
    requestBody?: ExtractRequestBodyIfExists<paths[P][M]>,
    cacheInvalidationMs = 86400000 // One day in ms
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    const defaultFilledParams = this.paramsWithDefaults(params as any);
    const pathSegments = splitAndResolvePath(path, defaultFilledParams);
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

  flush<P extends Path, M extends Method>(
    path: P,
    params?: Parameters<paths[P][M]>
  ) {
    this._flush(splitAndResolvePath(path, params), params);
  }

  private _flush<P extends Path, M extends Method>(
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

  private paramsWithDefaults<P extends Path, M extends Method>(
    params: ParametersWithOptionalQueryKeys<Parameters<paths[P][M]>, 'personToken' | 'lang'>
  ): Parameters<paths[P][M]> {
    return {
      ...(params || {}),
      query: {
        lang: this.translate.currentLang,
        personToken: this.userService.getToken(),
        ...((params as any).query || {})
      }
    } as any;
  }
}


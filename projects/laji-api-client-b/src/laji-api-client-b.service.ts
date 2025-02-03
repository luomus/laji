import { Inject, Injectable, InjectionToken } from '@angular/core';
import { components, operations, paths } from '../generated/api';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

type WithResponses<T> = T & { responses: unknown };
type Parameters<T> = 'parameters' extends keyof T ? T['parameters'] : undefined;
type ExtractContentIfExists<R> = R extends { content: { 'application/json': infer C } } ? C : null;
type ExtractRequestBodyIfExists<R> = R extends { requestBody: { content: { 'application/json': infer C } } } ? C : never;
type HttpSuccessCodes = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
type IntersectUnionTypes<A, B> = A extends B ? A : never;

type Path = keyof paths & string;
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

const sortRecordRecursively = (record: Record<string, unknown>): Record<string, unknown> => (
  Object.entries(record)
    .sort(([aKey, aVal], [bKey, bVal]) => aKey > bKey ? 1 : aKey < bKey ? -1 : 0)
    .reduce((acc, [key, value]) => {
      acc[key] = isRecord(value) ? sortRecordRecursively(value) : value;
      return acc;
    }, Object.create(null))
);

const hashRecord = (record: any): string => JSON.stringify(sortRecordRecursively(record));

const resolvePath = <
  P extends Path,
  M extends Method<P>,
>(path: P, params?: Parameters<paths[P][M]>): string => {
  let resolvedPath: string = path;
  if ((<any>params)?.['path']) {
    Object.entries((<any>params)['path']).forEach(([k, v]) => {
      resolvedPath = resolvedPath.replace(`{${k}}`, <any>v);
    });
  }
  return resolvedPath;
};

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
  providedIn: 'root'
})
export class LajiApiClientBService {
  private cache: Map<string, Map<string, CacheElement<any>>> = new Map();

  constructor(private http: HttpClient, @Inject(API_BASE_URL) private baseUrl: string) { }

  fetch<P extends Path, M extends Method<P>, R extends Responses<P, M>>(
    path: P,
    method: M,
    params: Parameters<paths[P][M]>,
    requestBody?: ExtractRequestBodyIfExists<paths[P][M]>,
    cacheInvalidationMs = 86400000 // 1day in ms
  ): Observable<ExtractContentIfExists<R[IntersectUnionTypes<keyof R, HttpSuccessCodes>]>> {
    const resolvedPath = resolvePath(path, params);
    const requestUrl = this.baseUrl + resolvedPath;
    const requestOptions = { params: (<any>params).query, body: requestBody };

    if (method !== 'get') {
      this.flush(path);
      return this.http.request(method as string, requestUrl, requestOptions) as any;
    }

    const pathHash = resolvedPath;
    if (!(this.cache.has(pathHash))) {
      this.cache.set(pathHash, new Map());
    }

    const cachedPath = this.cache.get(pathHash);

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
    endpoint: P,
    params?: Parameters<paths[P][M]>
  ) {
    const resolvedPath = resolvePath(endpoint, params);

    const pathHash = resolvedPath;
    if (!this.cache.has(pathHash)) {
      return;
    }

    if (params !== undefined) {
      const paramsHash = hashRecord(params);
      this.cache.get(pathHash)?.delete(paramsHash);
    } else {
      this.cache.delete(pathHash);
    }
  }
}


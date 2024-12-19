import { Injectable } from '@angular/core';
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

interface CachedValueNotStarted { _tag: 'not-started' };
interface CachedValueLoading<T> { obs: Observable<T>; _tag: 'loading' };
interface CachedValueCompleted<T> { val: T; lastRefresh: number; _tag: 'completed' };

type CacheElement<T> = CachedValueNotStarted | CachedValueLoading<T> | CachedValueCompleted<T>;

const concatObjProps = (obj: any) => hashArgs(Object.entries(obj).map(([k, v]) => k + hashArgs(v)));
const hashArgs = (...args: any): string => (
  args.reduce((prev: string, curr: any) => {
    if (curr instanceof Array) {
      return prev += hashArgs(...curr);
    }
    if (curr instanceof Object) {
      return prev += concatObjProps(curr);
    }
    return prev += curr;
  }, '')
);

const getPath = <
  T extends keyof paths & string,
  U extends keyof paths[T] & string,
>(endpoint: T, params: Parameters<paths[T][U]>): string => {
  let path: string = endpoint;
  if (params?.['path']) {
    Object.entries(params['path']).forEach(([k, v]) => {
      path = path.replace(`{${k}}`, <any>v);
    });
  }
  return path;
};

@Injectable({
  providedIn: 'root'
})
export class LajiApiClientBService {
  private baseUrl = 'http://localhost:3000/api';
  private cache: Map<string, Map<string, CacheElement<any>>> = new Map();

  constructor(private http: HttpClient) { }

  setBaseUrl(base: string) {
    //this.baseUrl = base;
  }

  fetch<
    T extends keyof paths & string,
    U extends keyof paths[T] & string,
    Responses extends WithResponses<paths[T][U]>['responses']
  >(
    endpoint: T,
    method: U,
    params: Parameters<paths[T][U]>,
    requestBody?: ExtractRequestBodyIfExists<paths[T][U]>,
    cacheInvalidationMs = 86400000 // 1day in ms
  ): Observable<ExtractContentIfExists<Responses[IntersectUnionTypes<keyof Responses, HttpSuccessCodes>]>> {
    const path = getPath(endpoint, params);
    const requestUrl = this.baseUrl + path;
    const requestOptions = { params: (<any>params).query, body: requestBody };

    if (method !== 'get') {
      this.flush(endpoint);
      return this.http.request(method, requestUrl, requestOptions) as any;
    }

    const pathHash = hashArgs(path);
    if (!(this.cache.has(pathHash))) {
      this.cache.set(pathHash, new Map());
    }

    const cachedPath = this.cache.get(pathHash);

    const paramsHash = hashArgs(params);
    if (!cachedPath.has(paramsHash)) {
      cachedPath.set(paramsHash, { _tag: 'not-started' });
    }

    const cachedParams = cachedPath.get(paramsHash);

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
        cachedPath.set(paramsHash, {
          _tag :'completed',
          val,
          lastRefresh: Date.now()
        });
      }),
      shareReplay(1)
    ) as any;

    cachedPath.set(paramsHash, {
      _tag: 'loading', obs
    });

    return obs;
  }

  flush<
    T extends keyof paths & string,
    U extends keyof paths[T] & string,
  >(endpoint: T, params?: Parameters<paths[T][U]>) {
    const path = getPath(endpoint, params);

    const pathHash = hashArgs(path);
    if (!this.cache.has(pathHash)) {
      return;
    }

    if (params !== undefined) {
      const paramsHash = hashArgs(params);
      this.cache.get(pathHash).delete(paramsHash);
    } else {
      this.cache.delete(pathHash);
    }
  }
}


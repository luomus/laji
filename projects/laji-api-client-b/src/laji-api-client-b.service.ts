import { Injectable } from '@angular/core';
import { components, operations, paths } from '../generated/api';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

type WithResponses<T> = T & { responses: unknown };
type Parameters<T> = 'parameters' extends keyof T ? T['parameters'] : undefined;
type ExtractContentIfExists<R> = R extends { content: { 'application/json': infer C } } ? C : null;
type ExtractRequestBodyIfExists<R> = R extends { requestBody: { content: { 'application/json': infer C } } } ? C : never;
type HttpSuccessCodes = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;
type IntersectUnionTypes<A, B> = A extends B ? A : never;

// Example: type aliases can be exported like so:
export type ApiUser = components['schemas']['ApiUser'];

// TODO merge with bird atlas hash fn !!!
//
// hash fn source: https://stackoverflow.com/a/15710692
// eslint-disable-next-line no-bitwise
const hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
const concatObjProps = (obj) => concatArgs(Object.entries(obj).map(([k, v]) => k + v));
const concatArgs = (...args): string => (
  args.reduce((prev, curr) => {
    if (curr instanceof Array) {
      return prev += concatArgs(...curr);
    }
    if (curr instanceof Object) {
      return prev += concatObjProps(curr);
    }
    return prev += curr;
  }, '')
);
const hashArgs = (...args) => hashCode(concatArgs(...args));

@Injectable({
  providedIn: 'root'
})
export class LajiApiClientBService {
  private baseUrl = 'http://localhost:3000/api';

  private cache = {};

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
    const hash = hashArgs(endpoint, method, params);
    if (!this.cache[hash]) {
      this.cache[hash] = { val: undefined, lastRefresh: 0 };
    }
    if (hash in this.cache && Date.now() - this.cache[hash].lastRefresh < cacheInvalidationMs) {
      return of(this.cache[hash].val);
    }

    let path: string = endpoint;
    if (params['path']) {
      Object.entries(params['path']).forEach(([k, v]) => {
        path = path.replace(`{${k}}`, <any>v);
      });
    }

    return this.http.request(method, this.baseUrl + path, { params: (<any>params).query, body: requestBody }).pipe(
      tap(val => {
        this.cache[hash] = {
          val,
          lastRefresh: Date.now()
        };
      })
    ) as any;
  }
}


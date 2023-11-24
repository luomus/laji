import { Injectable } from '@angular/core';
import { components, paths } from '../../generated/api';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type WithResponses<T> = T & { responses: unknown };
type Parameters<T> = 'parameters' extends keyof T ? T['parameters'] : undefined;

// Example: type aliases can be exported like so:
export type ApiUser = components['schemas']['ApiUser'];

@Injectable({
  providedIn: 'root'
})
export class LajiApiClientBService {
  constructor(private http: HttpClient) { }

  fetch<
    T extends keyof paths & string,
    U extends keyof paths[T] & string,
    HttpCode extends keyof WithResponses<paths[T][U]>['responses'] & number
  >(
    endpoint: T,
    method: U,
    params: Parameters<paths[T][U]>
  ): Observable<{ status: HttpCode } & WithResponses<paths[T][U]>['responses'][HttpCode]> {
    // TODO ...
    return <any>null;
  }

  test() {
    // Example:
    const a = this.fetch('/collections', 'get', {query: { page: 1 } });
  }
}

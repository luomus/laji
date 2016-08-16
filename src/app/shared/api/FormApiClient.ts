import {Http, Headers, RequestOptionsArgs, Response, URLSearchParams} from '@angular/http';
import {Injectable, Optional} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as models from '../model';
import 'rxjs/Rx';

@Injectable()
export class FormApiClient {
  protected basePath = '/api';
  public defaultHeaders: Headers = new Headers();
  private _lang:string;
  private _userToken:string;

  constructor(protected http: Http) {
  }

  public set lang(lang) {
    this._lang = lang;
  }

  public get lang() {
    return this._lang;
  }

  public set userToken(token) {
    this._userToken = token;
  }

  public get userToken() {
    return this._userToken;
  }

  public fetch(resource: string, query: any): Promise<any> {
    const path = this.basePath + resource;

    let queryParameters = new URLSearchParams();
    let headerParams = this.defaultHeaders;

    if (this._lang !== undefined) {
      queryParameters.set('lang', this._lang);
    }
    if (this._userToken !== undefined) {
      queryParameters.set('userToken', this._userToken);
    }

    for (let param in query) {
      if (!query.hasOwnProperty(param)) {
        continue;
      }
      if (query[param] !== undefined) {
        queryParameters.set(param, query[param]);
      }
    }

    let requestOptions: RequestOptionsArgs = {
      method: 'GET',
      headers: headerParams,
      search: queryParameters
    };

    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204 || response.status >= 400) {
          throw new Error("Request failed");
        } else {
          return response.json();
        }
      }).toPromise(Promise);
  }
}

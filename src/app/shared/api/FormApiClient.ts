import { Http, Headers, RequestOptionsArgs, Response, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/Rx';

@Injectable()
export class FormApiClient {
  protected basePath = '/api';
  public defaultHeaders: Headers = new Headers();
  private _lang: string;
  private _personToken: string;

  constructor(protected http: Http) {
  }

  public set lang(lang) {
    this._lang = lang;
  }

  public get lang() {
    return this._lang;
  }

  public set personToken(token) {
    this._personToken = token;
  }

  public get personToken() {
    return this._personToken;
  }

  public fetch(resource: string, query: any, options?: RequestOptionsArgs): Promise<any> {
    const path = this.basePath + resource;

    let queryParameters = new URLSearchParams();
    let headerParams = this.defaultHeaders;

    if (this._lang !== undefined) {
      queryParameters.set('lang', this._lang);
    }
    if (this._personToken !== undefined) {
      queryParameters.set('personToken', this._personToken);
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

    if (options) {
      requestOptions['method'] = options['method'] || 'GET';
      requestOptions['body'] = options['body'] || undefined;
    }

    return this.http.request(path, requestOptions)
      .map((response: Response) => {
        if (response.status === 204 || response.status >= 400) {
          throw new Error('Request failed');
        } else {
          return response.json();
        }
      }).toPromise(Promise);
  }
}

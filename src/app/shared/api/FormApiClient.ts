import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Util } from '../service/util.service';

@Injectable()
export class FormApiClient {
  protected basePath = '/api';
  private _lang: string;
  private _personToken: string;

  constructor(protected http: HttpClient) {
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

  public fetch(resource: string, query: any, options?: {method?: string, body?: any, headers?: {[header: string]: string | string[]}}): Promise<any> {
    const path = this.basePath + resource;

    const queryParameters = {...Util.removeUndefinedFromObject(query)};

    if (this._lang !== undefined) {
      queryParameters['lang'] = this._lang;
    }
    if (this._personToken !== undefined) {
      queryParameters['personToken'] = this._personToken;
    }

    if (!options) {
      options = {};
    }

    switch (resource) {
      case '/autocomplete/taxon':
        queryParameters['excludeNameTypes'] = 'MX.hasMisappliedName,MX.hasMisspelledName,MX.hasUncertainSynonym,MX.hasOrthographicVariant';
    }

    return this.http.request(
      options['method'] || 'GET',
      path,
      {headers: options['headers'], params: queryParameters, body: options['body'] || undefined, observe: 'response'}
    ).pipe(
      map((response) => ({...response, json: () => response.body}))
    ).toPromise(Promise);
  }
}

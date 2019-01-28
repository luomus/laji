import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Util } from '../service/util.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';

@Injectable()
export class FormApiClient {
  protected basePath = environment.apiBase;
  private _lang: string;
  private _personToken: string;
  private _formID: string;

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

  public set formID(id) {
    this._formID = id;
  }

  public get formID() {
    return this._formID;
  }

  public fetch(
    resource: string,
    query: any,
    options?: {method?: string, body?: any, headers?: {[header: string]: string | string[]}}
  ): Promise<any> {
    const path = this.basePath + resource;

    const queryParameters = {...Util.removeUndefinedFromObject(query)};

    ['lang', 'personToken', 'formID'].forEach(key => {
      if (this[key] !== undefined) {
        queryParameters[key] = this[key];
      }
    });

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
      map((response) => ({...response, json: () => response.body})),
      catchError(err => of({...err, json: () => err.error}))
    ).toPromise(Promise);
  }
}

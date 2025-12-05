import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Util } from '../service/util.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { TaxonAutocompleteService } from '../service/taxon-autocomplete.service';

const AUTOCOMPLETE_TAXON_RESOURCE = '/autocomplete/taxa';
const MEDIA_RESOURCES = ['/images', '/audio'];

@Injectable()
export class FormApiClient {
  protected basePath = environment.apiBase;
  private _lang?: string;
  private _personToken?: string;
  private _formID?: string;

  constructor(protected http: HttpClient,
              private taxonAutocompleteService: TaxonAutocompleteService) {
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
    options?: {method?: string; body?: any; headers?: {[header: string]: string | string[]}}
  ): Promise<any> {
    const path = this.basePath + resource;

    const queryParameters: Record<string, string> = Util.removeFromObject({
      ...query,
      formID: this.formID
    });

    if (!options) {
      options = {};
    }

    switch (resource) {
      case AUTOCOMPLETE_TAXON_RESOURCE:
        queryParameters['excludeNameTypes'] = 'MX.hasMisappliedName';
    }

    let timeout = '120000';
    if (MEDIA_RESOURCES.includes(resource) && options['method'] === 'POST') {
      timeout = '3600000';
    }

    const headers: Record<string, string> = {
      ...options['headers'],
      timeout,
      'Accept-language': this.lang!
    };
    if (this.personToken) {
      headers['Person-Token'] = this.personToken!;
    }

    return this.http.request(
      options['method'] || 'GET',
      path,
      {
        headers,
        params: queryParameters,
        body: options['body'] || undefined,
        observe: 'response'
      }
    ).pipe(
      switchMap(response => resource === AUTOCOMPLETE_TAXON_RESOURCE ?
        this.taxonAutocompleteService.getInfo((response.body as any).results, queryParameters['query']).pipe(
          map(taxa => ({
            ...response,
            body: taxa
          }))
        ) :
        of(response)
      ),
      map((response) => ({...response, json: () => response.body})),
      catchError(err => of({...err, json: () => err.error}))
    ).toPromise(Promise);
  }
}

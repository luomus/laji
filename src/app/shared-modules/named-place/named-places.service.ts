import { map, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { NamedPlaceApi, NamedPlaceQuery } from '../../shared/api/NamedPlaceApi';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { forkJoin, from, Observable, of, of as ObservableOf } from 'rxjs';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
const { JSONPath } = require('jsonpath-plus');

@Injectable({providedIn: 'root'})
export class NamedPlacesService {

  private cache;
  private cacheKey;

  private openBy: {[place: string]: 'label'|'boolean'} = {
    '$.municipality': 'label',
    '$.taxonIDs[0]': 'label',
    '$.prepopulatedDocument.gatherings[0].invasiveControlOpen': 'boolean'
  };

  constructor(
    private namedPlaceApi: NamedPlaceApi,
    private userService: UserService,
    private translateService: TranslateService,
    private triplestoreLabelService: TriplestoreLabelService
) { }

  invalidateCache() {
    this.cacheKey = '';
  }

  getAllNamePlaces(query: NamedPlaceQuery, openKeyValues?: string[]): Observable<NamedPlace[]>  {
    const key = JSON.stringify(query);
    if (this.cacheKey === key) {
      return ObservableOf(this.cache);
    }
    return this._getAllNamePlaces(query).pipe(
      tap(data => {
        this.cacheKey = key;
        this.cache = data;
      }),
      switchMap(nps => openKeyValues ? from(nps).pipe(mergeMap(np => this.openKeyValues(np, openKeyValues)), toArray()) : of(nps))
    );
  }

  getNamedPlace(id, userToken?: string, includeUnits = false): Observable<NamedPlace> {
    if (!id) {
      return ObservableOf(null);
    }
    return this.namedPlaceApi
      .findById(id, userToken, {includeUnits});
  }

  createNamedPlace(data: NamedPlace, userToken: string) {
    return this.namedPlaceApi
      .create(
        data,
        userToken
      );
  }

  updateNamedPlace(id: string, data: NamedPlace, userToken: string) {
    return this.namedPlaceApi
      .update(
        id,
        data,
        userToken
      );
  }

  reserve(id: string, options?: {until?: string, personID?: string}): Observable<NamedPlace> {
    return this.namedPlaceApi
      .reserve(id, this.userService.getToken(), options);
  }

  releaseReservation(id: string): Observable<NamedPlace> {
    return this.namedPlaceApi
      .releaseReservation(id, this.userService.getToken());
  }

  private _getAllNamePlaces(query: NamedPlaceQuery, page = 1, namedPlaces = []): Observable<NamedPlace[]>  {
    return this.namedPlaceApi
      .findAll(
        {
          ...query,
          userToken: this.userService.getToken()
        },
        '' + page,
        '1000'
      ).pipe(
      switchMap(
        result => {
          namedPlaces.push(...result.results);
          if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
            return this._getAllNamePlaces(query, result.currentPage + 1, namedPlaces);
          } else {
            return ObservableOf(namedPlaces);
          }
        }
      ));
  }

  private openKeyValues(np: NamedPlace, keyValues: string[]): Observable<NamedPlace> {
    return from(keyValues).pipe(
      mergeMap(path => this.openBy[path] ? this.openValue(np, path, this.openBy[path]) : of(np)),
      toArray(),
      map(() => np)
    );
  }

  private openValue(np: NamedPlace, path: string, type: string): Observable<NamedPlace> {
    const value = JSONPath({json: np, path: path, wrap: false, flatten: true});
    if (typeof value === 'undefined') {
      return of(np);
    }
    return Array.isArray(value) ?
      forkJoin(value.map((val, idx) => this.openSingleValue(val, np, path + '[' + idx  + ']', type))).pipe(map(() => np)) :
      this.openSingleValue(value, np, path, type);
  }

  private openSingleValue(value: any, np: NamedPlace, path: string, type: string): Observable<NamedPlace> {
    let convert$: Observable<string>;
    switch (type) {
      case 'boolean':
        convert$ = this.translateService.get(value === true || value === 'true' ? 'yes' : 'no');
        break;
      case 'label':
        convert$ = this.triplestoreLabelService.get(String(value), this.translateService.currentLang);
        break;
    }
    return convert$ ? (convert$.pipe(
      map(label => {
        JSONPath({json: np, path, callback: (v, t, payload) => {
            try {
              payload.parent[payload.parentProperty] = label;
            } catch (e) {}
          }});
        return np;
      })
    )) : of(np);
  }
}

import { map, mergeMap, catchError, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { NamedPlaceApi, NamedPlaceQuery } from '../api/NamedPlaceApi';
import { NamedPlace } from '../model/NamedPlace';
import { forkJoin, from, Observable, of, of as ObservableOf } from 'rxjs';
import { UserService } from './user.service';
import { TranslateService } from '@ngx-translate/core';
import { TriplestoreLabelService } from './triplestore-label.service';
import { ToastsService } from './toasts.service';
import { JSONPath } from 'jsonpath-plus';

@Injectable({providedIn: 'root'})
export class NamedPlacesService {

  private cache: NamedPlace[] = [];
  private cacheKey = '';
  private idCache: Record<string, Observable<NamedPlace | undefined>> = {};

  private deletedIds: Record<string, boolean> = {};

  private openBy: {[place: string]: 'label'|'boolean'} = {
    '$.municipality': 'label',
    '$.taxonIDs[0]': 'label',
    '$.prepopulatedDocument.gatherings[0].invasiveControlOpen': 'boolean'
  };

  constructor(
    private namedPlaceApi: NamedPlaceApi,
    private userService: UserService,
    private translateService: TranslateService,
    private triplestoreLabelService: TriplestoreLabelService,
    private toastService: ToastsService
) { }

  invalidateCache() {
    this.cacheKey = '';
    this.idCache = {};
  }

  getAllNamePlaces(query: NamedPlaceQuery, openKeyValues?: string[]): Observable<NamedPlace[]>  {
    const key = JSON.stringify(query);
    if (this.cacheKey === key) {
      return ObservableOf(this.cache);
    }
    return this._getAllNamePlaces(query).pipe(
      map(data => data.filter(np => !this.deletedIds[np.id])),
      tap(data => {
        this.cacheKey = key;
        this.cache = data;
      }),
      switchMap(nps => openKeyValues ? from(nps).pipe(mergeMap(np => this.openKeyValues(np, openKeyValues)), toArray()) : of(nps))
    );
  }

  getNamedPlace(id: string, userToken?: string, includeUnits = false): Observable<NamedPlace | undefined> {
    if (!id) {
      return ObservableOf(undefined);
    }
    const key = [id, userToken, includeUnits].join(':');
    if (!this.idCache[key]) {
      this.idCache[key] = this.namedPlaceApi
        .findById(id, userToken, {includeUnits}).pipe(
          catchError((err) => {
            const msgKey = err.status === 404
              ? 'observation.form.placeNotFound'
              : 'haseka.form.genericError';
            this.toastService.showWarning(this.translateService.instant(msgKey));
            return of(undefined);
          }),
          shareReplay(1)
        );
    }
    return this.idCache[key];
  }


  createNamedPlace(data: NamedPlace, userToken: string) {
    return this.namedPlaceApi
      .create(
        data,
        userToken
      ).pipe(tap(() => {
        this.invalidateCache();
      }));
  }

  updateNamedPlace(id: string, data: NamedPlace, userToken: string) {
    return this.namedPlaceApi
      .update(
        id,
        data,
        userToken
      ).pipe(tap(() => {
        this.invalidateCache();
      }));
  }

  deleteNamedPlace(id: string, userToken: string) {
    return this.namedPlaceApi
      .delete(
        id,
        userToken
      ).pipe(tap(() => {
        this.deletedIds[id] = true;
        this.invalidateCache();
      }));
  }

  reserve(id: string, options?: {until?: string; personID?: string}): Observable<NamedPlace> {
    return this.namedPlaceApi
      .reserve(id, this.userService.getToken(), options).pipe(
        tap(() => {
          this.invalidateCache();
        })
      );
  }

  releaseReservation(id: string): Observable<NamedPlace> {
    return this.namedPlaceApi
      .releaseReservation(id, this.userService.getToken()).pipe(
        tap(() => {
          this.invalidateCache();
        })
      );
  }

  private _getAllNamePlaces(query: NamedPlaceQuery, page = 1, namedPlaces: NamedPlace[] = []): Observable<NamedPlace[]>  {
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
    const value = JSONPath({json: np, path, wrap: false, flatten: true});
    if (typeof value === 'undefined') {
      return of(np);
    }
    return Array.isArray(value) ?
      forkJoin(value.map((val, idx) => this.openSingleValue(val, np, path + '[' + idx  + ']', type))).pipe(map(() => np)) :
      this.openSingleValue(value, np, path, type);
  }

  private openSingleValue(value: any, np: NamedPlace, path: string, type: string): Observable<NamedPlace> {
    let convert$: Observable<string> | undefined;
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

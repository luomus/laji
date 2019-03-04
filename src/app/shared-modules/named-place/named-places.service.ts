
import {switchMap, tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { NamedPlaceApi, NamedPlaceQuery } from '../../shared/api/NamedPlaceApi';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Observable, of as ObservableOf } from 'rxjs';
import { UserService } from '../../shared/service/user.service';

@Injectable({providedIn: 'root'})
export class NamedPlacesService {

  private cache;
  private cacheKey;

  constructor(
    private namedPlaceApi: NamedPlaceApi,
    private userService: UserService
  ) { }

  invalidateCache() {
    this.cacheKey = '';
  }

  getAllNamePlaces(query: NamedPlaceQuery)  {
    const key = JSON.stringify(query);
    if (this.cacheKey === key) {
      return ObservableOf(this.cache);
    }
    return this._getAllNamePlaces(query).pipe(
      tap(data => {
        this.cacheKey = key;
        this.cache = data;
      }));
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
}

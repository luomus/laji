import { Injectable } from '@angular/core';
import { NamedPlaceApi, NamedPlaceQuery } from '../../shared/api/NamedPlaceApi';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../../shared/service/user.service';

@Injectable()
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
      return Observable.of(this.cache);
    }
    return this._getAllNamePlaces(query)
      .do(data => {
        this.cacheKey = key;
        this.cache = data;
      });
  }

  getNamedPlace(id, userToken?: string) {
    if (this.cache) {
      for (const place of this.cache) {
        if (place.id === id) {
          return Observable.of(place);
        }
      }
    }
    return this.namedPlaceApi
      .findById(id, userToken);
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

  private _getAllNamePlaces(query: NamedPlaceQuery, page = 1, namedPlaces = [])  {
    return this.namedPlaceApi
      .findAll(
        {
          ...query,
          userToken: this.userService.getToken()
        },
        '' + page,
        '1000'
      )
      .switchMap(
        result => {
          namedPlaces.push(...result.results);
          if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
            return this._getAllNamePlaces(query, result.currentPage + 1, namedPlaces);
          } else {
            return Observable.of(namedPlaces);
          }
        }
      );
  }
}

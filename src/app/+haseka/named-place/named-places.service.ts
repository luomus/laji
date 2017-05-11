import { Injectable } from '@angular/core';
import { NamedPlaceApi } from '../../shared/api/NamedPlaceApi';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class NamedPlacesService {

  private cache;
  private cacheKey;

  constructor(private namedPlaceApi: NamedPlaceApi) { }

  getAllNamePlacesByCollectionId(collectionID: string)  {
    if (this.cacheKey === collectionID) {
      return Observable.of(this.cache);
    }
    return this._getAllNamePlacesByCollectionId(collectionID)
      .do(data => {
        this.cacheKey = collectionID;
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

  private _getAllNamePlacesByCollectionId(collectionID: string, page = 1, namedPlaces = [])  {
    return this.namedPlaceApi
      .findAll(
        undefined,
        collectionID,
        undefined,
        '' + page,
        '1000'
      )
      .switchMap(
        result => {
          namedPlaces.push(...result.results);
          if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
            return this._getAllNamePlacesByCollectionId(collectionID, result.currentPage + 1, namedPlaces);
          } else {
            return Observable.of(namedPlaces);
          }
        }
      );
  }
}

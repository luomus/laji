import { Injectable } from '@angular/core';
import { NamedPlaceApi } from '../../shared/api/NamedPlaceApi';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Observable } from 'rxjs';

@Injectable()
export class NamedPlacesService {

  constructor(private namedPlaceApi: NamedPlaceApi) { }

  getAllNamePlacesByCollectionId(collectionID: string, page = 1, namedPlaces = [])  {
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
            return this.getAllNamePlacesByCollectionId(collectionID, result.currentPage + 1, namedPlaces);
          } else {
            return Observable.of(namedPlaces);
          }
        }
      );
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
}

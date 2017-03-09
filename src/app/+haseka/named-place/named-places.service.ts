import { Injectable } from '@angular/core';
import { NamedPlaceApi } from '../../shared/api/NamedPlaceApi';
import { NamedPlace } from '../../shared/model/NamedPlace';

@Injectable()
export class NamedPlacesService {

  constructor(private namedPlaceApi: NamedPlaceApi) { }

  getAllNamePlacesByCollectionId(collectionID: string) {
    return this.namedPlaceApi
      .findAll(
        undefined,
        collectionID,
        undefined,
        undefined,
        undefined
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

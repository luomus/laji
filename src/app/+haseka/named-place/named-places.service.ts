import { Injectable } from '@angular/core';
import { NamedPlaceApi } from '../../shared/api/NamedPlaceApi';

@Injectable()
export class NamedPlacesService {

  constructor(private namedPlaceApi: NamedPlaceApi) { }

  getAllNamePlacesByCollectionId(collectionID: string, page = 1, pageSize = 100) {
    return this.namedPlaceApi
      .findAll(
        undefined,
        collectionID,
        undefined,
        '' + page,
        '' + pageSize
      );
  }

}

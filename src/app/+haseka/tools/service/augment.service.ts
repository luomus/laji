import { Injectable } from '@angular/core';
import { from as ObservableFrom, Observable, of as ObservableOf } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { NamedPlaceApi } from '../../../shared/api/NamedPlaceApi';
import { UserService } from '../../../shared/service/user.service';
import { Document } from '../../../shared/model/Document';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { map, mergeMap, toArray } from 'rxjs/operators';

@Injectable()
export class AugmentService {

  npCache: {[key: string]: NamedPlace} = {};
  requests: {[key: string]: Observable<any>} = {};

  constructor(
    private namedPlaceApi: NamedPlaceApi,
    private userService: UserService,
    private documentService: DocumentService
  ) { }

  augmentDocument(document: Document, excluded: string[] = []): Observable<Document> {
    const namedPlaces = [];
    const idxLookup = {};
    if (document && document.gatherings) {
      document.gatherings.forEach((gathering, idx) => {
        if (gathering.namedPlaceID) {
          namedPlaces.push(gathering.namedPlaceID);
          if (!idxLookup[gathering.namedPlaceID]) {
            idxLookup[gathering.namedPlaceID] = [];
          }
          idxLookup[gathering.namedPlaceID].push(idx);
        }
      });
    }
    if (namedPlaces.length === 0) {
      return ObservableOf(document);
    }
    return ObservableFrom(namedPlaces).pipe(
      mergeMap(id => this.getNamedPlace(id)),
      map(namedPlace => this.addNamedPlaceData(document, namedPlace, idxLookup, excluded)),
      toArray(),
      map(() => document)
    )
  }

  private addNamedPlaceData(document: Document, namedPlace: NamedPlace, idxs: {[key: string]: number[]}, excluded: string[]) {
    const id = namedPlace.id;
    if (
      idxs[id] &&
      namedPlace.prepopulatedDocument &&
      namedPlace.prepopulatedDocument.gatherings &&
      namedPlace.prepopulatedDocument.gatherings[0]
    ) {
      idxs[id].forEach(idx => {
        if (document.gatherings && document.gatherings[idx]) {
          this.augment(document.gatherings[idx], this.documentService.removeMeta(namedPlace.prepopulatedDocument.gatherings[0], excluded));
        }
      })
    }
    return document;
  }

  private augment(to: any, from: any) {
    return this.documentService.combine(to, from);
  }

  private getNamedPlace(id: string): Observable<NamedPlace> {
    if (this.npCache[id]) {
      return ObservableOf(this.npCache[id]);
    }
    if (!this.requests[id]) {
      return this.requests[id] = this.namedPlaceApi
        .findById(id, this.userService.getToken())
        .share();
    }
    return this.requests[id];
  }

}

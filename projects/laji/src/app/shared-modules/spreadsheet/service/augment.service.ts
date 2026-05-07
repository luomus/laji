import { map, mergeMap, toArray } from 'rxjs';
import { Injectable } from '@angular/core';
import { from as ObservableFrom, Observable, of as ObservableOf } from 'rxjs';
import { DocumentService } from '../../own-submissions/service/document.service';
import { MappingService } from './mapping.service';
import type { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type Document = components['schemas']['store-document'];
type NamedPlace = components['schemas']['store-namedPlace'];

@Injectable()
export class AugmentService {

  npCache: {[key: string]: NamedPlace} = {};
  requests: {[key: string]: Observable<any>} = {};

  constructor(
    private documentService: DocumentService,
    private mappingService: MappingService,
    private api: LajiApiClientBService
  ) { }

  augmentDocument(document: Document, excludedFromCopy: string[] = []): Observable<Document> {
    document = this.augmentEditors(document);
    return this.augmentNamedPlaces(document, excludedFromCopy);
  }

  private augmentEditors(document: Document) {
    if (!document.editors) {
      const editors = (document.gatheringEvent?.leg || document.gatherings?.[0]?.leg || [])
        .map(editor => this.mappingService.mapPerson(editor))
        .filter((editor): editor is string => typeof editor === 'string');

      this.augment(document, { editors });
    }

    return document;
  }

  private augmentNamedPlaces(document: Document, excluded: string[] = []): Observable<Document> {
    const namedPlaces: string[] = [];
    const idxLookup: Record<string, any> = {};

    if (document?.namedPlaceID) {
      namedPlaces.push(document.namedPlaceID);
    }

    if (document?.gatherings) {
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
      mergeMap(id => this.api.get('/named-places/{id}', { path: { id } })),
      map(namedPlace => this.addNamedPlaceData(document, namedPlace, idxLookup, excluded)),
      toArray(),
      map(() => document)
    );
  }

  private addNamedPlaceData(document: Document, namedPlace: NamedPlace, idxs: {[key: string]: number[]}, excluded: string[]) {
    const id = namedPlace.id!;

    if (id === document.namedPlaceID && namedPlace.prepopulatedDocument?.gatherings) {
      namedPlace.prepopulatedDocument?.gatherings.forEach((gathering, idx) => {
        if (document.gatherings?.[idx]) {
          this.augment(document.gatherings[idx], this.documentService.removeMeta(gathering, excluded));
        }
      });
    }

    if (
      idxs[id] &&
      namedPlace.prepopulatedDocument &&
      namedPlace.prepopulatedDocument.gatherings &&
      namedPlace.prepopulatedDocument.gatherings[0]
    ) {
      idxs[id].forEach(idx => {
        if (document.gatherings && document.gatherings[idx]) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.augment(document.gatherings[idx], this.documentService.removeMeta(namedPlace.prepopulatedDocument!.gatherings![0], excluded));
        }
      });
    }

    return document;
  }

  private augment(to: any, from: any) {
    return this.documentService.combine(to, from);
  }
}

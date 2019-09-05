import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { AbstractCachedHttpService } from './abstract-cached-http.service';

interface ICollectionRange {
  id: string;
  value: string;
}

@Injectable({providedIn: 'root'})
export class CollectionService extends AbstractCachedHttpService<ICollectionRange> {

  constructor(
    private metadataService: MetadataApi
  ) {
    super();
  }

  getAll(lang: string): Observable<ICollectionRange[]> {
    return this.fetchList(this.metadataService.metadataFindPropertiesRanges('MY.collectionID', lang, false, true), lang);
  }

  getName(id: string, lang): Observable<ICollectionRange[]> {
    return this.getAll(lang).pipe(
      map(data => data.filter(col => col.id === id))
    );
  }
}

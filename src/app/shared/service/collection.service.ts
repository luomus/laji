import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { WarehouseApi } from '../api/WarehouseApi';
import { IdService } from './id.service';

interface ICollectionRange {
  id: string;
  value: string;
}

@Injectable({providedIn: 'root'})
export class CollectionService extends AbstractCachedHttpService<ICollectionRange> {

  private allWarehouseCollection$;

  constructor(
    private metadataService: MetadataApi,
    private warehouseApi: WarehouseApi
  ) {
    super();
  }

  getAll(lang: string, mustHaveWarehouseData = false): Observable<ICollectionRange[]> {
    const all$ = this.fetchList(this.metadataService.metadataFindPropertiesRanges('MY.collectionID', lang, false, true), lang);
    if (mustHaveWarehouseData) {
      return this.getAllWarehouseCollections().pipe(
        switchMap(warehouseCollection => all$.pipe(
          map(cols => cols.filter(c => warehouseCollection.includes(c.id)))
        ))
      );
    }
    return all$;
  }

  getName(id: string, lang, empty: null|string = null): Observable<string> {
    return this.getAll(lang).pipe(
      map(data => data.find(col => col.id === id)),
      map(col => col ? col.value : (empty === null ? id : empty))
    );
  }

  private getAllWarehouseCollections(): Observable<string[]> {
    if (!this.allWarehouseCollection$) {
      this.allWarehouseCollection$ = this.fetchWarehouseCollections().pipe(
        shareReplay(1)
      );
    }
    return this.allWarehouseCollection$;
  }

  private fetchWarehouseCollections(page = 1, collections = []) {
    let hasMore = false;
    return this.warehouseApi.warehouseQueryAggregateGet({cache: true}, ['document.collectionId'], undefined, 1000, page).pipe(
      tap(data => hasMore = data.lastPage && data.lastPage > page),
      map(data => data.results || []),
      map(data => data.map(d => IdService.getId(d?.aggregateBy?.['document.collectionId']))),
      map(cols => [...collections, ...cols]),
      switchMap(cols => hasMore ? this.fetchWarehouseCollections(page + 1, cols) : of(cols))
    );
  }
}

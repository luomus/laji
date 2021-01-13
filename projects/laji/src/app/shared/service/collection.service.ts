import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { WarehouseApi } from '../api/WarehouseApi';
import { IdService } from './id.service';
import { GraphQLService } from '../../graph-ql/service/graph-ql.service';
import { gql } from 'apollo-angular';

interface ICollectionRange {
  id: string;
  value: string;
}

interface ICollectionsTreeNode {
  id: string;
  longName: string;
  hasChildren: boolean;
  children?: ICollectionsTreeNode[];
}

interface IQueryResult {
  collection: ICollectionsTreeNode[];
}

@Injectable({providedIn: 'root'})
export class CollectionService extends AbstractCachedHttpService<ICollectionRange> {

  private allWarehouseCollection$;
  private TREE_QUERY = gql`
  query {
    collection {
      id
      longName
      hasChildren
      children {
        id
        longName
        hasChildren
        children {
          id
          longName
          hasChildren
          children {
            id
            longName
            hasChildren
            children {
              id
              longName
              hasChildren
              children {
                id
                longName
                hasChildren
              }
            }
          }
        }
      }
    }
  }`;

  constructor(
    private metadataService: MetadataApi,
    private warehouseApi: WarehouseApi,
    private graphQlService: GraphQLService,
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

  getCollectionsTree(): Observable<ICollectionsTreeNode[]> {
    return this.graphQlService.query<IQueryResult>({
      query: this.TREE_QUERY,
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      context: {
        headers: {
          'x-timeout': '180000'
        }
      }

    }).pipe(
      map(({data}) => data),
      map(({collection}) => collection)
    );
  }

  getCollectionsAggregate(page = 1, collections = []): Observable<ICollectionRange[]> {
    let hasMore = false;
    return this.warehouseApi.warehouseQueryAggregateGet({cache: true}, ['document.collectionId'], undefined, 1000, page).pipe(
      tap(data => hasMore = data.lastPage && data.lastPage > page),
      map(data => data.results || []),
      map(data => data.map(d => {
        return {
          id: IdService.getId(d?.aggregateBy?.['document.collectionId']),
          count: d.count
        };
      })),
      map(cols => [...collections, ...cols]),
      switchMap(cols => hasMore ? this.getCollectionsAggregate(page + 1, cols) : of(cols)));
  }
}

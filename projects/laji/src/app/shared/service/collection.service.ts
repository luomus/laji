import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MetadataApi } from '../api/MetadataApi';
import { AbstractCachedHttpService } from './abstract-cached-http.service';
import { WarehouseApi } from '../api/WarehouseApi';
import { IdService } from './id.service';
import { GraphQLService } from '../../graph-ql/service/graph-ql.service';
import { gql } from 'apollo-angular';
import { WarehouseQueryInterface } from '../model/WarehouseQueryInterface';
import { Collection } from '../model/Collection';
import { CollectionApi } from '../api/CollectionApi';

export interface ICollectionRange {
  id: string;
  value: string;
}

export interface ICollectionsTreeNode {
  id: string;
  longName: string;
  hasChildren: boolean;
  collectionType: string;
  children?: ICollectionsTreeNode[];
}

interface IQueryResult {
  collection: ICollectionsTreeNode[];
}

@Injectable({providedIn: 'root'})
export class CollectionService extends AbstractCachedHttpService<ICollectionRange> {

  private allWarehouseCollection$?: Observable<string[]>;
  private TREE_QUERY = gql`
  query {
    collection {
      id
      longName
      hasChildren
      collectionType
      collectionQuality
      children {
        id
        longName
        hasChildren
        collectionType
        collectionQuality
        children {
          id
          longName
          hasChildren
          collectionType
          collectionQuality
          children {
            id
            longName
            hasChildren
            collectionType
            collectionQuality
            children {
              id
              longName
              hasChildren
              collectionType
              collectionQuality
              children {
                id
                longName
                hasChildren
                collectionType
                collectionQuality
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
    private collectionApi: CollectionApi,
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

  getById(id: string, lang?: string): Observable<Collection> {
    return this.collectionApi.findById(id, lang);
  }

  getName(id: string, lang: string, empty: null|string = null): Observable<string> {
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

  private fetchWarehouseCollections(page = 1, collections: any[] = []): Observable<string[]> {
    let hasMore = false;
    return this.warehouseApi.warehouseQueryAggregateGet({cache: true}, ['document.collectionId'], undefined, 1000, page).pipe(
      tap(data => hasMore = data.lastPage && data.lastPage > page),
      map(data => (data.results || []) as any[]),
      map((data) => data.map(d => IdService.getId(d?.aggregateBy?.['document.collectionId']))),
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
  
  getCollectionSpecimenCounts(id: string) {
    return this.warehouseApi.warehouseQueryAggregateGet({cache: true, collectionId: [id]}, ['unit.superRecordBasis', 'unit.typeSpecimen'], undefined, 1000).pipe(
      map(data => (data.results || []) as any[]),
      map(data => {
        const toReturn = {};

        data.forEach(data => {
          if (data.aggregateBy['unit.superRecordBasis'] === 'PRESERVED_SPECIMEN') {
            if (data.aggregateBy['unit.typeSpecimen']) {
              toReturn['typeSpecimen'] = data.count;
            } else {
              toReturn['specimen'] = data.count;
            }
          } else if (data.aggregateBy['unit.superRecordBasis'] === 'HUMAN_OBSERVATION_UNSPECIFIED') {
            toReturn['observation'] = data.count;
          }
        });

        return toReturn
      })
    )
  }

  getCollectionsAggregate(query?: WarehouseQueryInterface, page = 1, collections: any[] = []): Observable<ICollectionRange[]> {
    let hasMore = false;
    let cacheQuery = { cache: true };

    if (query) {
      cacheQuery = { ...cacheQuery, ...query };
    }

    return this.warehouseApi.warehouseQueryAggregateGet(cacheQuery, ['document.collectionId'], undefined, 1000, page).pipe(
      tap(data => hasMore = data.lastPage && data.lastPage > page),
      map(data => (data.results || []) as any[]),
      map(data => data.map(d => ({
          id: IdService.getId(d?.aggregateBy?.['document.collectionId']),
          count: d.count
        }))),
      map(cols => [...collections, ...cols]),
      switchMap(cols => hasMore ? this.getCollectionsAggregate(query, page + 1, cols) : of(cols)));
  }
}

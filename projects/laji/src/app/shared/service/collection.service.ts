import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
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
import { UserService } from './user.service';
import { ObservationFacade } from '../../+observation/observation.facade';

export interface ICollectionRange {
  id: string;
  value: string;
}

export interface ICollectionAggregate {
  id: string;
  count: number;
}

export interface ICollectionsTreeNode {
  id: string;
  longName: string;
  hasChildren: boolean;
  collectionType: string;
  collectionQuality: string;
  children?: ICollectionsTreeNode[];
}

interface IQueryResult {
  collection: ICollectionsTreeNode[];
}

export interface ICollectionCounts {
  specimen?: number;
  typeSpecimen?: number;
  observation?: number;
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
    private userService: UserService
  ) {
    super();
  }

  getAll$(lang: string, mustHaveWarehouseData = false): Observable<ICollectionRange[]> {
    const all$ = this.fetchList(this.metadataService.metadataFindPropertiesRanges('MY.collectionID', lang, false, true), lang);
    if (mustHaveWarehouseData) {
      return this.getAllWarehouseCollections$().pipe(
        switchMap(warehouseCollection => all$.pipe(
          map(cols => cols.filter(c => warehouseCollection.includes(c.id)))
        ))
      );
    }
    return all$;
  }

  getById$(id: string, lang?: string): Observable<Collection> {
    return this.collectionApi.findById(id, lang);
  }

  getName$(id: string, lang: string, empty: null|string = null): Observable<string> {
    return this.getAll$(lang).pipe(
      map(data => data.find(col => col.id === id)),
      map(col => col ? col.value : (empty === null ? id : empty))
    );
  }

  private getAllWarehouseCollections$(): Observable<string[]> {
    if (!this.allWarehouseCollection$) {
      this.allWarehouseCollection$ = this.fetchWarehouseCollections$().pipe(
        shareReplay(1)
      );
    }
    return this.allWarehouseCollection$;
  }

  private fetchWarehouseCollections$(page = 1, collections: any[] = []): Observable<string[]> {
    let hasMore = false;
    return this.warehouseApi.warehouseQueryAggregateGet({cache: true}, ['document.collectionId'], undefined, 1000, page).pipe(
      tap(data => hasMore = data.lastPage && data.lastPage > page),
      map(data => (data.results || []) as any[]),
      map((data) => data.map(d => IdService.getId(d?.aggregateBy?.['document.collectionId']))),
      map(cols => [...collections, ...cols]),
      switchMap(cols => hasMore ? this.fetchWarehouseCollections$(page + 1, cols) : of(cols))
    );
  }

  getCollectionsTree$(): Observable<ICollectionsTreeNode[]> {
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

  getCollectionSpecimenCounts$(id: string): Observable<ICollectionCounts> {
    return this.warehouseApi.warehouseQueryAggregateGet({cache: true, collectionId: [id]}, ['unit.superRecordBasis', 'unit.typeSpecimen'], undefined, 1000).pipe(
      map(data => (data.results || []) as any[]),
      map(data => {
        const toReturn: ICollectionCounts = {};

        data.forEach(d => {
          if (d.aggregateBy['unit.superRecordBasis'] === 'PRESERVED_SPECIMEN') {
            toReturn['specimen'] ? toReturn['specimen'] += d.count : toReturn['specimen'] = d.count;

            if (d.aggregateBy['unit.typeSpecimen'] === 'true') {
              toReturn['typeSpecimen'] ? toReturn['typeSpecimen'] += d.count : toReturn['typeSpecimen'] = d.count;
            }
          }

          toReturn['observation'] ? toReturn['observation'] += d.count : toReturn['observation'] = d.count;
        });

        return toReturn;
      })
    );
  }

  getCollectionsAggregate$(query?: WarehouseQueryInterface, page = 1, collections: any[] = []): Observable<ICollectionAggregate[]> {
    let hasMore = false;
    let cacheQuery = { cache: true };

    if (query) {
      cacheQuery = { ...cacheQuery, ...query };
    }

    return this.userService.isLoggedIn$.pipe(
      take(1),
      tap(loggedIn => {
        ['editorPersonToken', 'observerPersonToken', 'editorOrObserverPersonToken', 'editorOrObserverIsNotPersonToken'].forEach(key => {
          if (cacheQuery[key] === ObservationFacade.PERSON_TOKEN) {
            cacheQuery[key] = loggedIn ? this.userService.getToken() : undefined;
          }
        });
      }),
      switchMap(_ => this.warehouseApi.warehouseQueryAggregateGet(cacheQuery, ['document.collectionId'], undefined, 1000, page)),
      tap(data => hasMore = data.lastPage && data.lastPage > page),
      map(data => (data.results || []) as any[]),
      map(data => data.map(d => ({
        id: IdService.getId(d?.aggregateBy?.['document.collectionId']),
        count: d.count
      }))),
      map(cols => [...collections, ...cols]),
      switchMap(cols => hasMore ? this.getCollectionsAggregate$(query, page + 1, cols) : of(cols))
    );
  }
}

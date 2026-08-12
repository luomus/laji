import { map, shareReplay, switchMap, take, tap, catchError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { IdService } from './id.service';
import { GraphQLService } from '../../graph-ql/service/graph-ql.service';
import { gql } from 'apollo-angular';
import { WarehouseQueryInterface } from '../model/WarehouseQueryInterface';
import { UserService } from './user.service';
import { ObservationFacade } from '../../observation/observation.facade';
import { TreeOptionsNode } from '../../shared-modules/tree-select/tree-select.component';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { components, paths } from 'projects/laji-api-client/generated/api.d';

type Collection = components['schemas']['SensitiveCollection'];
type AggregateQueryParams = paths['/warehouse/query/unit/aggregate']['get']['parameters']['query'];

export interface CollectionTreeOptionsNode extends TreeOptionsNode {
  count: number;
}

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
  collection: {
    results: ICollectionsTreeNode[];
  };
};

export interface ICollectionCounts {
  specimen?: number;
  typeSpecimen?: number;
  observation?: number;
}

@Injectable({providedIn: 'root'})
export class CollectionService {

  private allWarehouseCollection$?: Observable<string[]>;
  private TREE_QUERY = gql`
    query {
      collection: CollectionsController_getTree {
        results {
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
      }
    }
  `;

  constructor(
    private graphQlService: GraphQLService,
    private userService: UserService,
    private api: LajiApiClientService
  ) {
  }

  getAllAsKeyValue$(mustHaveWarehouseData = false) {
    const all$ = this.api.get('/collections', { query: { selectedFields: 'id,collectionName', pageSize: 100000 } })
    .pipe(map(({results}) => results.map(({id, collectionName}) => ({ id, value: collectionName || id }))));
    if (mustHaveWarehouseData) {
      return this.getAllWarehouseCollections$().pipe(
        switchMap(warehouseCollection => all$.pipe(
          map(cols => cols.filter(c => warehouseCollection.includes(c.id)))
        ))
      );
    }
    return all$;
  }

  getById$(id: string): Observable<Collection> {
    return this.api.get('/collections/{id}', { path: { id } });
  }

  getName$(id: string): Observable<string> {
    return this.getAllAsKeyValue$().pipe(
      map(data => data.find(col => col.id === id)),
      map(col => col?.value ? col.value : id)
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
    const query: AggregateQueryParams = {
      cache: true,
      aggregateBy: ['document.collectionId'],
      pageSize: 1000,
      page
    };
    return this.api.get('/warehouse/query/unit/aggregate', { query }).pipe(
      tap((data: any) => hasMore = data.lastPage && data.lastPage > page),
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
        headers: new HttpHeaders({'x-timeout': '180000'})
      }

    }).pipe(
      catchError((err, caught) => {
        console.error('GraphQL error when getting collections tree: ', err, caught);
        return of({data: { collection: { results: [] } }});
      }),
      map(result => (result?.data?.collection?.results ?? []).filter((node): node is ICollectionsTreeNode => !!node))
    );
  }

  getCollectionSpecimenCounts$(id: string): Observable<ICollectionCounts> {
    const query: AggregateQueryParams = {
      cache: true,
      collectionId: id,
      aggregateBy: ['unit.superRecordBasis', 'unit.typeSpecimen'],
      pageSize: 1000,
    };
    return this.api.get('/warehouse/query/unit/aggregate', { query }).pipe(
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
          if ((cacheQuery as any)[key] === ObservationFacade.PERSON_TOKEN) {
            (cacheQuery as any)[key] = loggedIn ? this.userService.getToken() : undefined;
          }
        });
      }),
      switchMap(_ => {
        const aggregateQuery: AggregateQueryParams = {
          ...cacheQuery,
          aggregateBy: ['document.collectionId'],
          pageSize: 1000,
          page,
        };
        return this.api.get('/warehouse/query/unit/aggregate', { query: aggregateQuery });
      }),
      tap((data: any) => hasMore = data.lastPage && data.lastPage > page),
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

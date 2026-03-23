import { Injectable } from '@angular/core';
import { filter, Observable, of } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs';

import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SearchQueryService } from './search-query.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { PlatformService } from '../root/platform.service';
import deepEqual from 'deep-equal';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { paths } from 'projects/laji-api-client-b/generated/api';

type WarehouseQueryUnitAggregateQParams = paths['/warehouse/query/unit/aggregate']['get']['parameters']['query'];

export interface ObservationCounts {
  unitsCount: number | null;
  speciesCount: number | null;
  securedCount: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ObservationDataService {
  cacheCount$?: Observable<ObservationCounts>;
  lastQuery?: WarehouseQueryInterface;

  constructor(
    private searchQueryService: SearchQueryService,
    private platformService: PlatformService,
    private api: LajiApiClientBService,
  ) { }

  getData(query: WarehouseQueryInterface): Observable<ObservationCounts> {
    if (this.platformService.isServer) {
      return of(this.empty());
    }
    const newQuery = query;

    if (deepEqual(newQuery, this.lastQuery)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.cacheCount$!;
    }

    query = this.searchQueryService.getQuery({
      ...query,
      onlyCount: false,
      taxonCounts: true,
      cache: typeof query.cache === 'undefined' ? WarehouseApi.isEmptyQuery(query) : query.cache
    }, query);

    this.lastQuery = newQuery;
    this.cacheCount$ = this.api.get('/warehouse/query/unit/aggregate', { query: query as WarehouseQueryUnitAggregateQParams }).pipe(
      filter(data => typeof data !== 'string'),
      map(data => data.results?.[0]),
      map(res => ({
        unitsCount: res['count'] ?? null,
        speciesCount: res['speciesCount'] ?? null,
        securedCount: res['securedCount'] ?? null
      })),
      startWith(this.empty()),
      shareReplay(1)
    );

    return this.cacheCount$;
  }

  private empty() {
    return {
      unitsCount: null,
      speciesCount: null,
      securedCount: null
    };
  }
}

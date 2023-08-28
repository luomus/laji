import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';

import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SearchQueryService } from './search-query.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { PlatformService } from '../root/platform.service';

export interface IObservationData {
  count: number;
  speciesCount: number;
  securedCount: number;
}

const overrideType = {
  qualityIssues: 'array'
};

@Injectable({
  providedIn: 'root'
})
export class ObservationDataService {
  cacheCount$: Observable<IObservationData>;
  lastQuery: string;

  constructor(
    private searchQueryService: SearchQueryService,
    private platformService: PlatformService,
    private warehouseService: WarehouseApi
  ) { }

  getData(query: WarehouseQueryInterface): Observable<IObservationData> {
    if (this.platformService.isServer) {
      return of(this.empty());
    }
    const newQuery = JSON.stringify(query);

    if (newQuery === this.lastQuery) {
      return this.cacheCount$;
    }

    query = this.searchQueryService.getQuery({
      ...query,
      onlyCount: false,
      taxonCounts: true,
      cache: typeof query.cache === 'undefined' ? WarehouseApi.isEmptyQuery(query) : query.cache
    }, query);

    this.lastQuery = newQuery;
    this.cacheCount$ = this.warehouseService.warehouseQueryAggregateGet(query).pipe(
      map((data) => data.results?.[0]),
      map(res => {
        ['count', 'speciesCount', 'securedCount'].forEach(key => {
          if (!res[key]) {
            res[key] = null;
          }
        });
        return res;
      }),
      startWith(this.empty()),
      shareReplay(1)
    );

    return this.cacheCount$;
  }

  private empty() {
    return {
      count: null,
      speciesCount: null,
      securedCount: null
    };
  }
}

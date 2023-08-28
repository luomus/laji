import {gql} from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { DocumentNode } from 'graphql';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SearchQueryService } from './search-query.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { PlatformService } from '../root/platform.service';

export interface IObservationData {
  count: number;
  speciesCount: number;
  secureCount: number;
}

const overrideType = {
  qualityIssues: 'array'
};

@Injectable({
  providedIn: 'root'
})
export class ObservationDataService {

  constructor(
    private searchQueryService: SearchQueryService,
    private platformService: PlatformService,
    private warehouseService: WarehouseApi
  ) { }

  getData(query: WarehouseQueryInterface): Observable<IObservationData> {
    if (this.platformService.isServer) {
      return of(this.empty());
    }
    query = this.searchQueryService.getQuery({
      ...query,
      onlyCount: false,
      taxonCounts: true,
      cache: typeof query.cache === 'undefined' ? WarehouseApi.isEmptyQuery(query) : query.cache
    }, query);

    return this.warehouseService.warehouseQueryAggregateGet(query).pipe(
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
    );
  }

  private empty() {
    return {
      count: null,
      speciesCount: null,
      secureCount: null
    };
  }

  private getGraphQuery(query: WarehouseQueryInterface): DocumentNode {
    const queryParams = [];
    const unitValues = [];
    const speciesValues = ['aggregateBy: "unit.linkings.taxon.speciesId"'];
    const privateValues = [];

    this.searchQueryService.forEachType({
      cb: (type, key) => {
        if (SearchQueryService.isEmpty(query, key)) {
          return;
        }
        if (overrideType[key]) {
          type = overrideType[key];
        }
        switch (type) {
          case 'numeric':
            queryParams.push(`$${key}: Int`);
            unitValues.push(`${key}: $${key}`);
            break;
          case 'boolean':
            queryParams.push(`$${key}: Boolean`);
            unitValues.push(`${key}: $${key}`);
            break;
          case 'array':
            queryParams.push(`$${key}: [String!]`);
            unitValues.push(`${key}: $${key}`);
            break;
          default:
            queryParams.push(`$${key}: String`);
            unitValues.push(`${key}: $${key}`);
        }
      }
    });

    if (query.secured === undefined) {
      privateValues.push('secured: true');
    }

    return gql`
      query${this.getGraphQLFilters(queryParams)} {
        units${this.getGraphQLFilters(unitValues)} {
          total
        }
        species: units${this.getGraphQLFilters([...unitValues, ...speciesValues])} {
          total
        }
        private: units${this.getGraphQLFilters([...unitValues, ...privateValues])} {
          total
        }
      }
    `;
  }

  private getGraphQLFilters(query: string[] = []) {
    return query.length === 0 ? '' : `(${query.join(', ')})`;
  }
}

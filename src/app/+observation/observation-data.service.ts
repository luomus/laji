import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import { GraphQLService } from '../graph-ql/service/graph-ql.service';
import { HistoryService } from '../shared/service/history.service';
import { WarehouseQueryInterface } from '../shared/model/WarehouseQueryInterface';
import { SearchQueryService } from './search-query.service';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { PlatformService } from '../shared/service/platform.service';

export interface IObservationData {
  units: {
    total: number
  };
  species: {
    total: number
  };
  private: {
    total: number
  };
}

const overrideType = {
  'qualityIssues': 'array'
};

@Injectable({
  providedIn: 'root'
})
export class ObservationDataService {

  constructor(
    private graphQLService: GraphQLService,
    private historyService: HistoryService,
    private searchQueryService: SearchQueryService,
    private platformService: PlatformService
  ) { }

  getData(query: WarehouseQueryInterface): Observable<IObservationData> {
    if (this.platformService.isServer) {
      return of(this.empty());
    }
    query = this.searchQueryService.getQuery({
      ...query,
      cache: typeof query.cache === 'undefined' ? WarehouseApi.isEmptyQuery(query) : query.cache
    }, query);

    return this.graphQLService.query<IObservationData>({
      query: this.getGraphQuery(query),
      variables: query,
      // On first load we want to use the cached data from the server. On following loads we want to load the each time.
      fetchPolicy: this.historyService.isFirstLoad() ? 'cache-first' : 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      map(({data}) => data),
      map(res => {
        ['units', 'species', 'private'].forEach(key => {
          if (!res[key]) {
            res[key] = {total: null};
          }
        });
        return res;
      }),
      startWith(this.empty()),
    );
  }

  private empty() {
    return {
      units: {total: null},
      species: {total: null},
      private: {total: null}
    }
  }

  private getGraphQuery(query: WarehouseQueryInterface): DocumentNode {
    const queryParams = [];
    const unitValues = [];
    const speciesValues = ['aggregateBy: "unit.linkings.taxon.speciesId"', 'includeNonValidTaxa: false', 'taxonRankId: "MX.species"'];
    const privateValues = ['secured: true'];

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

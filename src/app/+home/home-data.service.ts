import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { GraphQLService } from '../graph-ql/service/graph-ql.service';
import { HistoryService } from '../shared/service/history.service';

export interface IHomeData {
  observations: {
    total: number
  };
  today: {
    total: number
  };
  speciesToday: {
    total: number
  };
  species: {
    total: number
  };
  sources: {
    total: number
  };
  preservedSpecimens: {
    total: number
  };
  preservedSpecimensWithImage: {
    total: number
  };
  news: {
    prevPage: number,
    nextPage: number,
    results: {
      id: string,
      title: string,
      posted: string,
      external: boolean,
      externalURL: string
    }
  };
}

const HOME_QUERY = gql`
  query($pageSize: Int = 5, $after: String = "") {
    observations: units(cache: true) {
      total
    }
    today: units(cache: true, countryId: "ML.206", firstLoadedSameOrAfter: $after) {
      total
    }
    speciesToday: units(cache: true, aggregateBy: "unit.linkings.taxon.id", countryId: "ML.206", firstLoadedSameOrAfter: $after) {
      total
    }
    species: units(cache: true, aggregateBy: "unit.linkings.taxon.id", taxonRankId: "MX.species") {
      total
    }
    sources: units(cache: true, aggregateBy: "document.collectionId") {
      total
    }
    preservedSpecimens: units(cache: true, superRecordBasis: "PRESERVED_SPECIMEN") {
      total
    }
    preservedSpecimensWithImage: units(cache: true, superRecordBasis: "PRESERVED_SPECIMEN", hasMedia: true) {
      total
    },
    news(pageSize: $pageSize) {
      prevPage,
      nextPage,
      results {
        id,
        title,
        tag,
        posted,
        external,
        externalURL
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class HomeDataService {
  constructor(
    private graphQLService: GraphQLService,
    private historyService: HistoryService
  ) { }

  public static getRecentDate(): string {
    const start = moment();
    start.subtract(1, 'd');

    return start.format('YYYY-MM-DD');
  }

  getHomeData(): Observable<IHomeData> {
    return this.graphQLService.query<IHomeData>({
      query: HOME_QUERY,
      variables: {
        after: HomeDataService.getRecentDate()
      },
      // On first load we want to use the cached data from the server. On following loads we want to load the each time.
      fetchPolicy: this.historyService.isFirstLoad() ? 'cache-first' : 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      map(({data}) => data)
    );
  }
}

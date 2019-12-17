import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import * as moment from 'moment';

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
    observations {
      total
    }
    today: observations(countryId: "ML.206", firstLoadedSameOrAfter: $after) {
      total
    }
    speciesToday: observations(aggregateBy: "unit.linkings.taxon.id", countryId: "ML.206", firstLoadedSameOrAfter: $after) {
      total
    }
    species: observations(aggregateBy: "unit.linkings.taxon.id", taxonRankId: "MX.species") {
      total
    }
    sources: observations(aggregateBy: "document.collectionId") {
      total
    }
    preservedSpecimens: observations(superRecordBasis: "PRESERVED_SPECIMEN") {
      total
    }
    preservedSpecimensWithImage: observations(superRecordBasis: "PRESERVED_SPECIMEN", hasMedia: true) {
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

@Injectable()
export class HomeDataService {
  constructor(
    private apollo: Apollo
  ) { }

  getHomeData(): Observable<IHomeData> {
    const start = moment();
    start.subtract(1, 'd');

    return this.apollo.query<IHomeData>({
      query: HOME_QUERY,
      variables: {
        after: start.format('YYYY-MM-DD')
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      map(({data}) => data)
    );
  }
}

import {gql} from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs';
import moment from 'moment';
import { GraphQLService } from '../graph-ql/service/graph-ql.service';
import { HistoryService } from '../shared/service/history.service';
import { Image } from '../shared/gallery/image-gallery/image.interface';
import { environment } from '../../environments/environment';
import { Global } from '../../environments/global';
import { components } from 'projects/laji-api-client/generated/api.d';

type News = components['schemas']['LajiBackendNewsNode'];

export interface IHomeData {
  observations: {
    total: number;
  };
  today: {
    total: number;
  };
  unitsLastWeek: {
    total: number;
  };
  speciesToday: {
    total: number;
  };
  species: {
    total: number;
  };
  sources: {
    total: number;
  };
  preservedSpecimens: {
    total: number;
  };
  preservedSpecimensWithImage: {
    total: number;
  };
  identify: {
    results: {
      media: Pick<Image, 'thumbnailURL'>;
    }[];
  };
  news: {
    prevPage: number;
    nextPage: number;
    results: Pick<News, 'id'|'title'|'external'|'externalURL'|'tags'|'posted'>[];
  };
}

const NEWS_TAGS = ['release', 'taxonomy', 'technical', 'luke.fi', 'luomus.fi', 'syke.fi', 'vieraslajit.fi'];
if (environment.type === Global.type.vir) {
  NEWS_TAGS.push('viranomaiset');
}

const HOME_QUERY = gql`
  query($pageSize: Int = 5, $after: String = "", $week: String = "") {
    observations: warehouse_query_unit_count(
      cache: true
    ) {
      total
    }
    today: warehouse_query_unit_count(
      cache: true
      countryId: "ML.206"
      firstLoadedSameOrAfter: $after
    ) {
      total
    }
    unitsLastWeek: warehouse_query_unit_count(
      cache: true
      countryId: "ML.206"
      firstLoadedSameOrAfter: $week
    ) {
      total
    }
    speciesToday: warehouse_query_unit_aggregate(
      cache: true
      aggregateBy: unit_linkings_taxon_id
      countryId: "ML.206"
      firstLoadedSameOrAfter: $after
    ) {
      total
    }
    species: warehouse_query_unit_aggregate(
      cache: true
      aggregateBy: unit_linkings_taxon_id
      taxonRankId: "MX.species"
    ) {
      total
    }
    sources: warehouse_query_unit_aggregate(
      cache: true
      aggregateBy: document_collectionId
    ) {
      total
    }
    preservedSpecimensWithImage: warehouse_query_unit_count(
      cache: true
      superRecordBasis: PRESERVED_SPECIMEN
      hasMedia: true
    ) {
      total
    }
    identify: warehouse_query_unitMedia_list(
      cache: true
      unidentified: true
      sourceId: "KE.389,KE.1221,KE.176"
      orderBy: document_firstLoadDate
    ) {
      results {
        media {
          thumbnailURL
        }
      }
    }
    news: NewsController_getPage(
      pageSize: $pageSize
      tag: "${NEWS_TAGS.join(',')}"
    ) {
      prevPage
      nextPage
      results {
        id
        title
        tags
        posted
        external
        externalURL
        posted
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

  public static getLastWeek(): string {
    const start = moment();
    start.subtract(7, 'd');

    return start.format('YYYY-MM-DD');
  }

  getHomeData(): Observable<IHomeData> {
    return this.graphQLService.query<IHomeData>({
      query: HOME_QUERY,
      variables: {
        after: HomeDataService.getRecentDate(),
        week: HomeDataService.getLastWeek()
      },
      // On first load we want to use the cached data from the server. On following loads we want to load the each time.
      fetchPolicy: this.historyService.isFirstLoad() ? 'cache-first' : 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      map(res => res?.data),
      catchError(() => of(null)),
      map<any, IHomeData>(data => data ?? {
        observations: { total: null },
        today: { total: null },
        speciesToday: { total: null },
        species: { total: null },
        sources: { total: null },
        preservedSpecimens: { total: null },
        preservedSpecimensWithImage: { total: null },
        identify: { results: [ ] },
        news: { prevPage: null, nextPage: null, results: [] }
      })
    );
  }
}

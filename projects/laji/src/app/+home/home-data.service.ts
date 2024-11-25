import {gql} from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import * as moment from 'moment';
import { GraphQLService } from '../graph-ql/service/graph-ql.service';
import { HistoryService } from '../shared/service/history.service';
import { Image } from '../shared/gallery/image-gallery/image.interface';
import { News } from '../shared/model/News';
import { environment } from '../../environments/environment';
import { Global } from '../../environments/global';

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
      unit: {
        media: Pick<Image, 'thumbnailURL'>[];
      };
    }[];
  };
  news: {
    prevPage: number;
    nextPage: number;
    results: Pick<News, 'id'|'title'|'external'|'externalURL'|'tag'|'posted'>[];
  };
}

const NEWS_TAGS = ['release', 'taxonomy', 'technical', 'luke.fi', 'luomus.fi', 'syke.fi', 'vieraslajit.fi'];
if (environment.type === Global.type.vir) {
  NEWS_TAGS.push('viranomaiset');
}

/* eslint-disable max-len */
const HOME_QUERY = gql`
  query($pageSize: Int = 5, $after: String = "", $week: String = "") {
    observations: units(cache: true) {
      total
    }
    today: units(cache: true, countryId: "ML.206", firstLoadedSameOrAfter: $after) {
      total
    }
    unitsLastWeek: units(cache: true, countryId: "ML.206", firstLoadedSameOrAfter: $week) {
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
    identify: units(cache: true, hasUnitMedia: true, unidentified: true, sourceId: "KE.389,KE.1221,KE.176", page: 1, pageSize: 12, orderBy: "document.firstLoadDate DESC") {
      results {
        unit {
          media {
            thumbnailURL
          }
        }
      }
    },
    news(pageSize: $pageSize, tag: "${NEWS_TAGS.join(',')}") {
      prevPage,
      nextPage,
      results {
        id,
        title,
        tag,
        posted,
        external,
        externalURL,
        posted
      }
    }
  }
`;
/* eslint-enable max-len */

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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { GraphQLService } from '../../graph-ql/service/graph-ql.service';

export interface HorizontalChartData {
    data: {
      taxon: {
        vernacularName: string,
        scientificName: string
      }
    };
}


const HOME_QUERY = gql`
    query($identification: ID = "") {
      taxon(id: $identification) {
        vernacularName,
        scientificName
      }
    }
`;

@Injectable()
export class HorizontalchartDataService {
  constructor(
    private graphQLService: GraphQLService
  ) { }


  getChartDataLabels(id): Observable<HorizontalChartData> {
    return this.graphQLService.query<HorizontalChartData>({
      query: HOME_QUERY,
      variables: {
          identification: id
      },
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      map(({data}) => data)
    );
  }
}

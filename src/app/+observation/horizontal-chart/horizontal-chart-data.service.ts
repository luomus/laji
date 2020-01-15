import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { GraphQLService } from '../../graph-ql/service/graph-ql.service';


@Injectable()
export class HorizontalchartDataService {
  constructor(
    private graphQLService: GraphQLService
  ) { }


  getChartDataLabels(ids: string[]): Observable<{[key: string]: {vernacularName: string, scientificName: string}}> {
    const queryParts = ids.map((id, idx) => `r${idx}: taxon(id: "${id}") { vernacularName, scientificName }`);
    console.log(`
    query {
      ${queryParts.join('\n')}
    }
    `);
    return this.graphQLService.query<{[key: string]: {vernacularName: string, scientificName: string}}>({
      query: gql`
      query {
        ${queryParts.join('\n')}
      }
      `,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }).pipe(
      map(({data}) => data),
    );
  }
}

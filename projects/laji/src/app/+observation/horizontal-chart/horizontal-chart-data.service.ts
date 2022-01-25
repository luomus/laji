import {gql} from 'apollo-angular';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { GraphQLService } from '../../graph-ql/service/graph-ql.service';

export const MAX_TAXA_SIZE = 30;

@Injectable()
export class HorizontalChartDataService {
  constructor(
    private graphQLService: GraphQLService
  ) { }


  getChartDataLabels(ids: string[]): Observable<{[key: string]: {vernacularName: string, scientificName: string}}> {
    if (ids.length === 0) { return of({}); }
    const params: string[] = [];
    const queryParts: string[] = [];
    const variables = {};
    for (let i = 0; i < MAX_TAXA_SIZE; i++) {
      const key = `t${i}`;
      params.push(`$${key}: ID = ""`);
      queryParts.push(`r${i}: taxon(id: $${key}) { vernacularName, scientificName }`);
      variables[key] = ids[i];
    }
    return this.graphQLService.query<{[key: string]: {vernacularName: string, scientificName: string}}>({
      query: gql`
      query(${params.join(', ')}) {
        ${queryParts.join('\n')}
      }
      `,
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
      variables
    }).pipe(
      map(({data}) => data),
    );
  }
}

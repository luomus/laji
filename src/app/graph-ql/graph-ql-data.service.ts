import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BASE_QUERY, IBaseQuery } from './base-query';

export interface IBaseDataVariables {
  lang: string;
}

@Injectable({
  providedIn: 'root'
})
export class GraphQLDataService {
  constructor(
    private apollo: Apollo
  ) { }

  getBaseData(variables: IBaseDataVariables): Observable<IBaseQuery> {
    return this.apollo.query<IBaseQuery>({
      query: BASE_QUERY,
      variables
    }).pipe(
      map(({data}) => data)
    );
  }
}

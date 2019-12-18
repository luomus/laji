import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult, QueryOptions as ApolloQueryOptions } from 'apollo-client';
import { R } from 'apollo-angular/types';
import { Observable } from 'rxjs';

export interface QueryOptions<T> extends ApolloQueryOptions<T> {}
export interface QueryResults<T> extends ApolloQueryResult<T> {}

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {

  constructor(private apollo: Apollo) { }

  query<T, V = R>(options: QueryOptions<V>): Observable<QueryResults<T>> {
    return this.apollo.query<T, V>(options);
  }
}

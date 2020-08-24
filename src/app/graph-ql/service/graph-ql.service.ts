import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult, QueryOptions as ApolloQueryOptions } from 'apollo-client';
import { R, WatchQueryOptions } from 'apollo-angular/types';
import { Observable } from 'rxjs';
import { QueryRef as ApolloQueryRef } from 'apollo-angular/QueryRef';

export interface QueryOptions<T> extends ApolloQueryOptions<T> {}
export interface QueryResults<T> extends ApolloQueryResult<T> {}
export interface QueryRef<T, V = R> extends ApolloQueryRef<T, V> {}

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {

  constructor(private apollo: Apollo) { }

  query<T, V = R>(options: QueryOptions<V>): Observable<QueryResults<T>> {
    return this.apollo.query<T, V>(options);
  }


  watchQuery<T, V = R>(options: WatchQueryOptions<V>): QueryRef<T, V> {
    return this.apollo.watchQuery<T, V>(options);
  }

  flushCache() {
    try {
      this.apollo.getClient().cache.reset().then();
    } catch (e) {}
  }
}

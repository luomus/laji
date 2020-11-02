import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult, QueryOptions } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { EmptyObject, WatchQueryOptions } from 'apollo-angular/types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {

  constructor(private apollo: Apollo) { }

  query<T, V = EmptyObject>(options: QueryOptions<V>): Observable<ApolloQueryResult<T>> {
    return this.apollo.query<T, V>(options);
  }


  watchQuery<TData, TVariables = EmptyObject>(options: WatchQueryOptions<TVariables>): QueryRef<TData, TVariables> {
    return this.apollo.watchQuery<TData, TVariables>(options);
  }

  flushCache() {
    try {
      this.apollo.getClient().cache.reset().then();
    } catch (e) {}
  }
}

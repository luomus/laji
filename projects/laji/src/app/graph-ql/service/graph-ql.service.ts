import { Apollo, QueryRef } from 'apollo-angular';
import { ApolloQueryResult, OperationVariables, QueryOptions } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { EmptyObject, WatchQueryOptions } from 'apollo-angular/types';
import { EMPTY, Observable } from 'rxjs';
import { PlatformService } from '../../root/platform.service';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {

  constructor(private apollo: Apollo, private platformService: PlatformService) { }

  query<T, V = EmptyObject>(options: QueryOptions<V>): Observable<ApolloQueryResult<T>> {
    if (this.platformService.isServer) {
      return EMPTY;
    }
    return this.apollo.query<T, V>(options);
  }


  watchQuery<TData, TVariables extends OperationVariables = EmptyObject>(options: WatchQueryOptions<TVariables, TData>): QueryRef<TData, TVariables>|undefined {
    if (this.platformService.isServer) {
      return undefined;
    }
    return this.apollo.watchQuery<TData, TVariables>(options);
  }

  flushCache() {
    try {
      this.apollo.getClient().cache.reset().then();
    } catch (e) {}
  }
}

import { Apollo, QueryRef } from 'apollo-angular';
import { OperationVariables, QueryOptions, WatchQueryOptions } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { PlatformService } from '../../root/platform.service';
import { EmptyObject } from 'node_modules/apollo-angular/types';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  constructor(private apollo: Apollo, private platformService: PlatformService) { }

  query<T, V extends OperationVariables = OperationVariables>(options: QueryOptions<V>): Observable<Apollo.QueryResult<T>> {
    if (this.platformService.isServer) {
      return EMPTY as Observable<Apollo.QueryResult<T>>;
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
      this.apollo.client.cache.reset().then();
    } catch (e) {}
  }
}

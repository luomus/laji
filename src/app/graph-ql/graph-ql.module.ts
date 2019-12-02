import { NgModule } from '@angular/core';

import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const uri = 'http://localhost:3001/graphql';

@NgModule({
  declarations: [],
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  constructor(apollo: Apollo, httpLink: HttpLink) {

    const http = httpLink.create({ uri });

    apollo.create({
      link: http,
      cache: new InMemoryCache()
    });
  }
}

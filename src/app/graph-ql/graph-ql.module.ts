import { NgModule } from '@angular/core';

import { Apollo, ApolloModule } from 'apollo-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from '../../environments/environment';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';
import { TranslateService } from '@ngx-translate/core';
import { concatMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { GraphQLService } from './service/graph-ql.service';

@NgModule({
  declarations: [],
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true},
    GraphQLService
  ]
})
export class GraphQLModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
    translateService: TranslateService
  ) {

    const cache = new InMemoryCache();
    const http = httpLink.create({
      uri: `${environment.apiBase}/graphql`
    });

    translateService.onLangChange.pipe(
      concatMap(() => from(cache.reset()))
    ).subscribe(() => {}, (e) => console.error(e));

    apollo.create({
      link: http,
      cache
    });
  }
}

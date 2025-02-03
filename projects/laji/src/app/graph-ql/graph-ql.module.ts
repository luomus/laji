import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';
import { TranslateService } from '@ngx-translate/core';
import { concatMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { GraphQLService } from './service/graph-ql.service';
import { PlatformService } from '../root/platform.service';

@NgModule({
  declarations: [],
  imports: [ApolloModule],
  exports: [
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true},
    GraphQLService
  ]
})
export class GraphQLModule {
  private readonly cache: InMemoryCache;

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private translateService: TranslateService,
    private platformService: PlatformService
  ) {
    this.cache = new InMemoryCache({
      addTypename: false
    });

    translateService.onLangChange.pipe(
      concatMap(() => from(this.cache.reset()))
    ).subscribe(() => {}, (e) => console.error(e));

    apollo.create({
      link: httpLink.create({
        uri: `${environment.apiBase}/graphql`
      }),
      cache: this.cache,
      ...(this.platformService.isBrowser ? {} : { ssrMode: true })
    });
  }
}

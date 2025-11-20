import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { NgModule, inject } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';
import { TranslateService } from '@ngx-translate/core';
import { concatMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { GraphQLService } from './service/graph-ql.service';
import { PlatformService } from '../root/platform.service';

export function createApollo(
  httpLink: HttpLink,
  translateService: TranslateService,
  platformService: PlatformService
) {
  const cache = new InMemoryCache({ addTypename: false });

  translateService.onLangChange
    .pipe(concatMap(() => from(cache.reset())))
    .subscribe({ error: (e) => console.error(e) });

  return {
    link: httpLink.create({
      uri: `${environment.apiBase}/graphql`
    }),
    cache,
    ...(platformService.isBrowser ? {} : { ssrMode: true })
  };
}

@NgModule({
  imports: [HttpClientModule],
  exports: [HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AcceptLanguageInterceptor, multi: true },
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      const translateService = inject(TranslateService);
      const platformService = inject(PlatformService);
      return createApollo(
        httpLink, translateService, platformService
      );
    }),
    GraphQLService,
  ]
})
export class GraphQLModule {}

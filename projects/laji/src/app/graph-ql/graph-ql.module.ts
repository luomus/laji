import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { NgModule, inject } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, firstValueFrom } from 'rxjs';
import { from } from 'rxjs';
import { GraphQLService } from './service/graph-ql.service';
import { PlatformService } from '../root/platform.service';
import { SetContextLink } from '@apollo/client/link/context';
import { UserService } from '../shared/service/user.service';
import { withNonNullableValues } from '../shared/utils';

export function createApollo(
  httpLink: HttpLink,
  translateService: TranslateService,
  platformService: PlatformService,
  userService: UserService
) {
  const cache = new InMemoryCache();

  translateService.onLangChange
    .pipe(concatMap(() => from(cache.reset())))
    .subscribe({ error: (e) => console.error(e) });

  const http = httpLink.create({
    uri: `${environment.apiBase}/graphql`
  });

  const headers = new SetContextLink(async (context) => {
    const includePersonToken = !context.omitPersonToken && await firstValueFrom(
      userService.isLoggedIn$
    );

    return {
      headers: withNonNullableValues({
        'api-version': '1',
        'person-token': includePersonToken ? userService.getToken() : undefined,
        'accept-language': translateService.getCurrentLang() ?? 'en',
      })
    };
  });

  return {
    link: ApolloLink.from([headers, http]),
    cache,
    ...(platformService.isBrowser ? {} : { ssrMode: true })
  };
}

@NgModule({ exports: [], imports: [], providers: [
        provideApollo(() => {
            const httpLink = inject(HttpLink);
            const translateService = inject(TranslateService);
            const platformService = inject(PlatformService);
            const userService = inject(UserService);
            return createApollo(httpLink, translateService, platformService, userService);
        }),
        GraphQLService,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class GraphQLModule {}

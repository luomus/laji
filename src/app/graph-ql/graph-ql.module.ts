import {Apollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {InMemoryCache, NormalizedCacheObject} from '@apollo/client/core';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AcceptLanguageInterceptor } from './accept-language.interceptor';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, filter } from 'rxjs/operators';
import { from } from 'rxjs';
import { GraphQLService } from './service/graph-ql.service';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { PlatformService } from '../shared/service/platform.service';

const GRAPH_QL_STATE_KEY = makeStateKey<any>('graphql.state');

@NgModule({
  declarations: [],
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
  private currentLang;

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private translateService: TranslateService,
    private transferState: TransferState,
    private platformService: PlatformService
  ) {
    this.cache = new InMemoryCache({
      addTypename: false
    });

    translateService.onLangChange.pipe(
      filter(langChange => {
        // Dont reset the cache on first change since we might have carried the state from the server to browser!
        if (this.currentLang === undefined) {
          this.currentLang = langChange.lang;
          return false;
        }
        return true;
      }),
      concatMap(() => from(this.cache.reset()))
    ).subscribe(() => {}, (e) => console.error(e));

    apollo.create({
      link: httpLink.create({
        uri: `${environment.apiBase}/graphql`
      }),
      cache: this.cache,
      ...(this.platformService.isBrowser ? { ssrForceFetchDelay: 5000 } : { ssrMode: true })
    });

    if (this.platformService.isBrowser) {
      this.onBrowser();
    } else {
      this.onServer();
    }
  }

  private onBrowser() {
    const state = this.transferState.get<NormalizedCacheObject>(
      GRAPH_QL_STATE_KEY,
      null,
    );
    this.cache.restore(state);
    this.transferState.remove(GRAPH_QL_STATE_KEY);
  }

  private onServer() {
    this.transferState.onSerialize(GRAPH_QL_STATE_KEY, () => this.cache.extract());
  }
}

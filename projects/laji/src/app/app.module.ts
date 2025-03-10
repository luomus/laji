import { APP_ID, ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger } from './shared/logger';
import { LoggerApi } from './shared/api/LoggerApi';
import { ILogger } from './shared/logger/logger.interface';
import { AppRoutingModule } from './app-routing.modules';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { LocalizeRouterService } from './locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from './shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponentModule } from './shared-modules/app-component/app-component.module';
import { TimeoutInterceptor } from './shared/interceptor/timeout.interceptor';
import { LazyTranslateLoader } from './shared/translate/lazy-translate-loader';
import { LajiUiModule } from '../../../laji-ui/src/public-api';
import { GraphQLModule } from './graph-ql/graph-ql.module';
import { QuicklinkModule } from 'ngx-quicklink';
import { TransferHttpCacheInterceptor } from './shared/interceptor/transfer-http-cache.interceptor';
import { BrowserModule, provideClientHydration, Title } from '@angular/platform-browser';
import { LajiTitle } from './shared/service/laji-title';
import { LocaleModule } from './locale/locale.module';
import { API_BASE_URL } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}


@NgModule({
  imports: [
    BrowserModule,
    AppComponentModule,
    LocaleModule,
    GraphQLModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    QuicklinkModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    NgxWebstorageModule.forRoot({prefix: 'laji-', separator: ''}),
    LajiUiModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    {provide: APP_ID, useValue: 'laji-app'},
    {provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: TransferHttpCacheInterceptor, multi: true},
    {provide: APP_BASE_HREF, useValue: '/'},
    {provide: API_BASE_URL, useValue: environment.apiBase},
    DocumentService,
    {provide: ErrorHandler, useClass: LajiErrorHandler},
    LocalizeRouterService,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {
      provide: Logger,
      deps: [LoggerApi],
      useFactory: createLoggerLoader
    },
    {provide: Title, useClass: LajiTitle},
    provideClientHydration()
  ],
})
export class AppModule {
}

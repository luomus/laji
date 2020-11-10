import { NgtUniversalModule } from '@ng-toolkit/universal';
import { ErrorHandler, NgModule } from '@angular/core';
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
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { QuicklinkModule } from 'ngx-quicklink';
import { TransferHttpCacheInterceptor } from './shared/interceptor/transfer-http-cache.interceptor';
import { BrowserModule, Title } from '@angular/platform-browser';
import { LajiApiInterceptor } from './shared/service/laji-api.interceptor';
import { LajiTitle } from './shared/service/laji-title';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}


@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'laji-app'}),
    AppComponentModule,
    GraphQLModule,
    HttpClientModule,
    NgtUniversalModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    QuicklinkModule,
    AppRoutingModule,
    CarouselModule.forRoot(),
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    TypeaheadModule.forRoot(),
    PopoverModule.forRoot(),
    ProgressbarModule.forRoot(),
    NgxWebstorageModule.forRoot({prefix: 'laji-', separator: ''}),
    LajiUiModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: LajiApiInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: TransferHttpCacheInterceptor, multi: true},
    {provide: APP_BASE_HREF, useValue: '/'},
    DocumentService,
    {provide: ErrorHandler, useClass: LajiErrorHandler},
    LocalizeRouterService,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {
      provide: Logger,
      deps: [LoggerApi],
      useFactory: createLoggerLoader
    },
    {provide: Title, useClass: LajiTitle}
  ],
})
export class AppModule {
}

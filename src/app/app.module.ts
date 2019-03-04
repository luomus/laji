import { NgtUniversalModule } from '@ng-toolkit/universal';
import { ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger } from './shared/logger/index';
import { LoggerApi } from './shared/api/LoggerApi';
import { ILogger } from './shared/logger/logger.interface';
import { AppRoutingModule } from './app-routing.module';
import { TranslateFileLoader } from './shared/translate/translate-file-loader';
import {
  AlertModule,
  BsDropdownModule,
  CarouselModule,
  ModalModule,
  PaginationModule,
  PopoverModule,
  ProgressbarModule,
  TooltipModule,
  TypeaheadModule
} from 'ngx-bootstrap';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { LocalizeRouterService } from './locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from './shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponentModule } from './shared-modules/app-component/app-component.module';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}


@NgModule({
  imports: [
    AppComponentModule,
    BrowserModule.withServerTransition({appId: 'laji-app'}),
    CommonModule,
    HttpClientModule,
    NgtUniversalModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateFileLoader
      }
    }),
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
    AppRoutingModule,
    TransferHttpCacheModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '/'},
    DocumentService,
    {provide: ErrorHandler, useClass: LajiErrorHandler},
    LocalizeRouterService,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {
      provide: Logger,
      deps: [LoggerApi],
      useFactory: createLoggerLoader
    }
  ],
})
export class AppModule {
}

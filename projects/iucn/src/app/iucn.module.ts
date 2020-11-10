import { NgtUniversalModule } from '@ng-toolkit/universal';
import { ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SharedModule } from '../../../laji/src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from '../../../laji/src/app/shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger } from '../../../laji/src/app/shared/logger/index';
import { LoggerApi } from '../../../laji/src/app/shared/api/LoggerApi';
import { ILogger } from '../../../laji/src/app/shared/logger/logger.interface';
import { TranslateFileLoader } from '../../../laji/src/app/shared/translate/translate-file-loader';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { LocalizeRouterService } from '../../../laji/src/app/locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from '../../../laji/src/app/shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { BrowserModule } from '@angular/platform-browser';
import { IucnRoutingModule } from './iucn-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponentModule } from '../../../laji/src/app/shared-modules/app-component/app-component.module';
import { AppComponent } from '../../../laji/src/app/shared-modules/app-component/app.component';
import { GraphQLModule } from '../../../laji/src/app/graph-ql/graph-ql.module';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}


@NgModule({
  imports: [
    GraphQLModule,
    AppComponentModule,
    BrowserAnimationsModule,
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
    IucnRoutingModule,
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
  bootstrap: [AppComponent]
})
export class IucnModule {
}

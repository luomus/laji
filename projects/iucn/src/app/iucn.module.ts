import { NgtUniversalModule } from '@ng-toolkit/universal';
import { ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SharedModule } from '../../../../src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from '../../../../src/app/shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger } from '../../../../src/app/shared/logger/index';
import { LoggerApi } from '../../../../src/app/shared/api/LoggerApi';
import { ILogger } from '../../../../src/app/shared/logger/logger.interface';
import { TranslateFileLoader } from '../../../../src/app/shared/translate/translate-file-loader';
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
import { LocalizeRouterService } from '../../../../src/app/locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from '../../../../src/app/shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { BrowserModule } from '@angular/platform-browser';
import { IucnRoutingModule } from './iucn-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponentModule } from '../../../../src/app/shared-modules/app-component/app-component.module';
import { AppComponent } from '../../../../src/app/shared-modules/app-component/app.component';
import { IucnCommonModule } from '../../../../src/app/shared-modules/iucn/iucn.module';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}


@NgModule({
  imports: [
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
    IucnCommonModule,
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

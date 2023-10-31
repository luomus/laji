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
import { LocaleModule } from 'projects/laji/src/app/locale/locale.module';

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
    LocaleModule,
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
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
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

import { ErrorHandler, NgModule } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { LangSelectComponent } from './shared/navbar/lang-select.component';
import { SharedModule } from './shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { FeedbackComponent } from './shared/feedback/feedback.component';
import { ConsoleLogger, HttpLogger, Logger } from './shared/logger/index';
import { LoggerApi } from './shared/api/LoggerApi';
import { AppConfig } from './app.config';
import { ILogger } from './shared/logger/logger.interface';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateFileLoader } from './shared/translate/translate-file-loader';
import { WhatsNewComponent } from './shared/whats-new/whats-new.component';
import { BrowserModule } from '@angular/platform-browser';
import {
  AlertModule,
  BsDropdownModule,
  ModalModule,
  PaginationModule,
  PopoverModule,
  TooltipModule,
  TypeaheadModule
} from 'ngx-bootstrap';
import { CoreModule } from './shared/core.module';
import { Ng2Webstorage } from 'ng2-webstorage';
import { ViewerModule } from './+viewer/viewer.module';
import { ToastModule } from 'ng2-toastr/src/toast.module';
import { NamedPlaceModule } from './+haseka/named-place/named-place.module';
import { ForumComponent } from './forum/forum.component';

export function createLoggerLoader(loggerApi: LoggerApi, appConfig: AppConfig): ILogger {
  const env = appConfig.getEnv();
  if (env === 'prod' || env === 'staging') {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}

@NgModule({
  declarations: [
    AppComponent, NavbarComponent, FooterComponent, FeedbackComponent, LangSelectComponent,
    WhatsNewComponent,
    ForumComponent
  ],
  imports: [
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateFileLoader
      }
    }),
    NamedPlaceModule.forRoot(),
    ToastModule.forRoot(),
    SharedModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    AlertModule.forRoot(),
    TypeaheadModule.forRoot(),
    PopoverModule.forRoot(),
    Ng2Webstorage.forRoot({ prefix: 'laji-', separator: '' }),
    CoreModule,
    AppRoutingModule,
    ViewerModule,
    BrowserModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    {provide: ErrorHandler, useClass: LajiErrorHandler},
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {
      provide: Logger,
      deps: [LoggerApi, AppConfig],
      useFactory: createLoggerLoader
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }

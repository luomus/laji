import { NgModule, ErrorHandler } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { LangSelectComponent } from './shared/navbar/lang-select.component';
import { SharedModule } from './shared/shared.module';
import { TranslateModule, TranslateLoader } from 'ng2-translate';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { FeedbackComponent } from './shared/feedback/feedback.component';
import { Logger, ConsoleLogger, HttpLogger } from './shared/logger/index';
import { LoggerApi } from './shared/api/LoggerApi';
import { AppConfig } from './app.config';
import { ILogger } from './shared/logger/logger.interface';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateFileLoader } from './shared/translate/translate-file-loader';
import { WhatsNewComponent } from './shared/whats-new/whats-new.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule, TabsModule, PaginationModule, DropdownModule, AlertModule, ModalModule } from 'ng2-bootstrap';
import { CoreModule } from './shared/core.module';

export function createTranslateLoader(): TranslateLoader {
  return new TranslateFileLoader();
}

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
    WhatsNewComponent
  ],
  imports: [
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: createTranslateLoader
    }),
    CoreModule,
    SharedModule.forRoot(),
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    DropdownModule.forRoot(),
    TooltipModule.forRoot(),
    AppRoutingModule,
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
      useClass: ConsoleLogger
    },
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }

import { NgtUniversalModule } from '@ng-toolkit/universal';
import { ErrorHandler, NgModule } from '@angular/core';
import { LocationStrategy, PathLocationStrategy, CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { FeedbackComponent } from './shared/feedback/feedback.component';
import { ConsoleLogger, HttpLogger, Logger } from './shared/logger/index';
import { LoggerApi } from './shared/api/LoggerApi';
import { ILogger } from './shared/logger/logger.interface';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AppRoutingModule } from './app-routing.module';
import { TranslateFileLoader } from './shared/translate/translate-file-loader';
import { WhatsNewComponent } from './shared/whats-new/whats-new.component';
import {
  AlertModule,
  BsDropdownModule,
  ModalModule,
  PaginationModule,
  ProgressbarModule,
  PopoverModule,
  TooltipModule,
  TypeaheadModule, CarouselModule
} from 'ngx-bootstrap';
import { Ng2Webstorage } from 'ngx-webstorage';
import { ViewerModule } from './+viewer/viewer.module';
import { ForumComponent } from './forum/forum.component';
import { LocaleEnComponent } from './locale/locale-en.component';
import { LocaleFiComponent } from './locale/locale-fi.component';
import { LocaleSvComponent } from './locale/locale-sv.component';
import { LocalizeRouterService } from './locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from './shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { BrowserModule } from '@angular/platform-browser';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}


@NgModule({
  declarations: [
    AppComponent, NavbarComponent, FooterComponent, FeedbackComponent,
    WhatsNewComponent,
    ForumComponent,
    LocaleEnComponent,
    LocaleFiComponent,
    LocaleSvComponent
  ],
  imports: [
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
    Ng2Webstorage.forRoot({prefix: 'laji-', separator: ''}),
    AppRoutingModule,
    ViewerModule,
    TransferHttpCacheModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
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

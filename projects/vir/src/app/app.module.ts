import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { ToastrModule } from 'ngx-toastr';

import { VirRoutingModule } from './vir-routing.module';
import { GraphQLModule } from '../../../laji/src/app/graph-ql/graph-ql.module';
import { AppComponentModule } from '../../../laji/src/app/shared-modules/app-component/app-component.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../laji/src/app/shared/shared.module';
import { DocumentService } from '../../../laji/src/app/shared-modules/own-submissions/service/document.service';
import { LajiErrorHandler } from '../../../laji/src/app/shared/error/laji-error-handler';
import { LocalizeRouterService } from '../../../laji/src/app/locale/localize-router.service';
import { ConsoleLogger, HttpLogger, ILogger, Logger } from '../../../laji/src/app/shared/logger';
import { LoggerApi } from '../../../laji/src/app/shared/api/LoggerApi';
import { DocumentViewerModule } from '../../../laji/src/app/shared-modules/document-viewer/document-viewer.module';
import { VirAppComponent } from './vir-app.component';
import { environment } from '../environments/environment';
import { NavBarComponent } from './component/nav-bar/nav-bar.component';
import { UsageDropdownComponent } from './component/nav-bar/usage-dropdown/usage-dropdown.component';
import { LazyTranslateLoader } from './service/lazy-translate-loader';
import { GlobalMessageComponent } from './component/global-message/global-message.component';
import { FooterComponent } from './component/footer/footer.component';
import { LocaleModule } from 'projects/laji/src/app/locale/locale.module';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';
import { OmniSearchModule } from 'projects/laji/src/app/shared-modules/omni-search/omni-search.module';

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
        useClass: LazyTranslateLoader
      }
    }),
    CarouselModule.forRoot(),
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    ModalModule.forRoot(),
    DropdownModule,
    TooltipModule.forRoot(),
    NgxWebstorageModule.forRoot({prefix: 'vir-', separator: ''}),
    VirRoutingModule,
    TransferHttpCacheModule,
    DocumentViewerModule,
    OmniSearchModule
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
  bootstrap: [VirAppComponent],
  declarations: [VirAppComponent, NavBarComponent, GlobalMessageComponent, FooterComponent, UsageDropdownComponent]
})
export class AppModule { }

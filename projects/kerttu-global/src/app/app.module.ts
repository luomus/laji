import { APP_ID, ErrorHandler, NgModule } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SharedModule } from '../../../laji/src/app/shared/shared.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LajiErrorHandler } from '../../../laji/src/app/shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger, ILogger } from '../../../laji/src/app/shared/logger';
import { LoggerApi } from '../../../laji/src/app/shared/api/LoggerApi';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { LocalizeRouterService } from '../../../laji/src/app/locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from '../../../laji/src/app/shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TransferHttpCacheModule } from '@angular/ssr';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { GraphQLModule } from '../../../laji/src/app/graph-ql/graph-ql.module';
import { LazyTranslateLoader } from './kerttu-global-shared/service/lazy-translate-loader';
import { NavbarComponent } from './navbar/navbar.component';
import { AppComponentModule } from '../../../laji/src/app/shared-modules/app-component/app-component.module';
import { LajiUiModule } from '../../../laji-ui/src/lib/laji-ui.module';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';

export function createLoggerLoader(loggerApi: LoggerApi): ILogger {
  if (environment.production) {
    return new HttpLogger(loggerApi);
  }
  return new ConsoleLogger();
}

@NgModule({
  imports: [
    GraphQLModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    DropdownModule,
    NgxWebstorageModule.forRoot({prefix: 'kerttu-global-', separator: ''}),
    AppRoutingModule,
    TransferHttpCacheModule,
    AppComponentModule,
    LajiUiModule
  ],
  providers: [
    {provide: APP_ID, useValue: 'laji-app'},
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
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    NavbarComponent
  ]
})
export class AppModule { }

import { APP_ID, ErrorHandler, NgModule, inject, provideAppInitializer } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { SharedModule } from '../../../laji/src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LajiErrorHandler } from '../../../laji/src/app/shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger } from '../../../laji/src/app/shared/logger/index';
import { ILogger } from '../../../laji/src/app/shared/logger/logger.interface';
import { TranslateFileLoader } from '../../../laji/src/app/shared/translate/translate-file-loader';
import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { LocalizeRouterService } from '../../../laji/src/app/locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from '../../../laji/src/app/shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { IucnRoutingModule } from './iucn-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponentModule } from '../../../laji/src/app/shared-modules/app-component/app-component.module';
import { AppComponent } from '../../../laji/src/app/shared-modules/app-component/app.component';
import { GraphQLModule } from '../../../laji/src/app/graph-ql/graph-ql.module';
import { LocaleModule } from 'projects/laji/src/app/locale/locale.module';
import { API_BASE_URL, LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { detectLangFromPath } from 'projects/laji/src/app/app.module';
import { setLocale } from 'projects/laji/src/app/locale/locale.component';

export function createLoggerLoader(api: LajiApiClientBService): ILogger {
  if (environment.production) {
    return new HttpLogger(api);
  }
  return new ConsoleLogger();
}


@NgModule({
  exports: [
    TranslateModule
  ],
  bootstrap: [AppComponent],
  imports: [
    GraphQLModule,
    AppComponentModule,
    LocaleModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: TranslateFileLoader
      }
    }),
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    IucnRoutingModule
  ],
  providers: [
    { provide: APP_ID, useValue: 'laji-app' },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: API_BASE_URL, useValue: environment.apiBase },
    provideAppInitializer(() => {
      const platformLocation = inject(PlatformLocation);
      const translate = inject(TranslateService);

      const path = platformLocation.pathname;
      const lang = detectLangFromPath(path);

      translate.setFallbackLang((environment as any).defaultLang ?? 'fi');
      return setLocale(lang);
    }),
    DocumentService,
    { provide: ErrorHandler, useClass: LajiErrorHandler },
    LocalizeRouterService,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: Logger,
      deps: [LajiApiClientBService],
      useFactory: createLoggerLoader
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxWebstorage(
      withNgxWebstorageConfig({ prefix: 'laji-', separator: '' }),
      withLocalStorage(),
      withSessionStorage()
    ),
  ]
})
export class IucnModule {
}

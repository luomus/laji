import { APP_ID, ErrorHandler, NgModule, inject, provideAppInitializer } from '@angular/core';
import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LajiErrorHandler } from './shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger } from './shared/logger';
import { ILogger } from './shared/logger/logger.interface';
import { AppRoutingModule } from './app-routing.modules';
import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { LocalizeRouterService } from './locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from './shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponentModule } from './shared-modules/app-component/app-component.module';
import { TimeoutInterceptor } from './shared/interceptor/timeout.interceptor';
import { LazyTranslateLoader } from './shared/translate/lazy-translate-loader';
import { LajiUiModule } from '../../../laji-ui/src/public-api';
import { GraphQLModule } from './graph-ql/graph-ql.module';
import { QuicklinkModule } from 'ngx-quicklink';
import { BrowserModule, provideClientHydration, Title } from '@angular/platform-browser';
import { LajiTitle } from './shared/service/laji-title';
import { LocaleModule } from './locale/locale.module';
import { API_BASE_URL, LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';


export function createLoggerLoader(api: LajiApiClientBService): ILogger {
  if (environment.production) {
    return new HttpLogger(api);
  }
  return new ConsoleLogger();
}

export function detectLangFromPath(pathname: string, langs = ['en', 'sv'], defaultLang = 'fi') {
  const langFromPath = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (langs.includes(langFromPath)) {
    return langFromPath;
  }
  return defaultLang;
}

@NgModule({
  exports: [
    TranslateModule,
    AppComponentModule
  ],
  imports: [
    BrowserModule,
    AppComponentModule,
    LocaleModule,
    GraphQLModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    QuicklinkModule,
    AppRoutingModule,
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    LajiUiModule
  ],
  providers: [
    { provide: APP_ID, useValue: 'laji-app' },
    { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: API_BASE_URL, useValue: environment.apiBase },
    provideAppInitializer(async () => {
      const platformLocation = inject(PlatformLocation);
      const path = platformLocation.pathname;
      const translate = inject(TranslateService);
      const lang = detectLangFromPath(path);
      return translate.use(lang);
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
    { provide: Title, useClass: LajiTitle },
    provideClientHydration(),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch()
    ),
    provideNgxWebstorage(
  		withNgxWebstorageConfig({ prefix: 'laji-', separator: '' }),
  		withLocalStorage(),
  		withSessionStorage()
    ),
  ]
})
export class AppModule {
}

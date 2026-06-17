import { APP_ID, ErrorHandler, NgModule, inject, provideAppInitializer } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { SharedModule } from '../../../laji/src/app/shared/shared.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { LajiErrorHandler } from '../../../laji/src/app/shared/error/laji-error-handler';
import { ConsoleLogger, HttpLogger, Logger, ILogger } from '../../../laji/src/app/shared/logger';
import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { LocalizeRouterService } from '../../../laji/src/app/locale/localize-router.service';
import { environment } from '../environments/environment';
import { DocumentService } from '../../../laji/src/app/shared-modules/own-submissions/service/document.service';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { GraphQLModule } from '../../../laji/src/app/graph-ql/graph-ql.module';
import { LazyTranslateLoader } from './bsg-shared/service/lazy-translate-loader';
import { NavbarComponent } from './navbar/navbar.component';
import { AppComponentModule } from '../../../laji/src/app/shared-modules/app-component/app-component.module';
import { LajiUiModule } from '../../../laji-ui/src/lib/laji-ui.module';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';
import { API_BASE_URL, LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { detectLangFromPath } from 'projects/laji/src/app/app.module';
import { setLocale } from 'projects/laji/src/app/app-routing.modules';
import { LocaleModule } from './locale/locale.module';

export function createLoggerLoader(api: LajiApiClientService): ILogger {
  if (environment.production) {
    return new HttpLogger(api);
  }
  return new ConsoleLogger();
}

@NgModule({ bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    NavbarComponent
  ], imports: [
    GraphQLModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    LocaleModule,
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    DropdownModule,
    AppRoutingModule,
    AppComponentModule,
    LajiUiModule],
  providers: [
    { provide: APP_ID, useValue: 'laji-app' },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: API_BASE_URL, useValue: environment.apiBase },
    provideAppInitializer(() => {
      const platformLocation = inject(PlatformLocation);
      const translate = inject(TranslateService);

      const path = platformLocation.pathname;
      const lang = detectLangFromPath(path, ['es', 'fr'], 'en');

      translate.setFallbackLang((environment as any).defaultLang ?? 'en');
      return setLocale(lang);
    }),
    DocumentService,
    { provide: ErrorHandler, useClass: LajiErrorHandler },
    LocalizeRouterService,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: Logger,
      deps: [LajiApiClientService],
      useFactory: createLoggerLoader
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxWebstorage(
      withNgxWebstorageConfig({ prefix: 'bsg-', separator: '' }),
      withLocalStorage(),
      withSessionStorage()
    ),
  ] })

export class AppModule { }

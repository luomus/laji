import { BrowserModule } from '@angular/platform-browser';
import { APP_ID, ErrorHandler, NgModule, inject, provideAppInitializer } from '@angular/core';
import { APP_BASE_HREF, CommonModule, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { ToastrModule } from 'ngx-toastr';
import { VirRoutingModule } from './vir-routing.module';
import { GraphQLModule } from '../../../laji/src/app/graph-ql/graph-ql.module';
import { AppComponentModule } from '../../../laji/src/app/shared-modules/app-component/app-component.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { SharedModule } from '../../../laji/src/app/shared/shared.module';
import { DocumentService } from '../../../laji/src/app/shared-modules/own-submissions/service/document.service';
import { LajiErrorHandler } from '../../../laji/src/app/shared/error/laji-error-handler';
import { LocalizeRouterService } from '../../../laji/src/app/locale/localize-router.service';
import { ConsoleLogger, HttpLogger, ILogger, Logger } from '../../../laji/src/app/shared/logger';
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
import { VirAuthenticatedHttpInterceptor } from './service/vir-authenticated-http.interceptor';
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
  bootstrap: [VirAppComponent],
  declarations: [VirAppComponent, NavBarComponent, GlobalMessageComponent, FooterComponent, UsageDropdownComponent], imports: [GraphQLModule,
    AppComponentModule,
    LocaleModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    ToastrModule.forRoot(),
    SharedModule.forRoot(),
    DropdownModule,
    VirRoutingModule,
    DocumentViewerModule],
  providers: [
    { provide: APP_ID, useValue: 'vir-app' },
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: API_BASE_URL, useValue: environment.apiBase },
    provideAppInitializer(async () => {
      const platformLocation = inject(PlatformLocation);
      const translate = inject(TranslateService);

      const path = platformLocation.pathname;
      const lang = detectLangFromPath(path);

      translate.setFallbackLang((environment as any).defaultLang ?? 'fi');
      setLocale(lang);
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: VirAuthenticatedHttpInterceptor,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxWebstorage(
      withNgxWebstorageConfig({ prefix: 'vir-', separator: '' }),
      withLocalStorage(),
      withSessionStorage()
    ),
  ]
})
export class AppModule { }

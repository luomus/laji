import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LazyTranslateLoader } from './locale/lazy-translate-loader';
import { NotFoundComponent } from 'projects/laji/src/app/shared/not-found/not-found.component';
import { LocaleModule } from 'projects/laji/src/app/locale/locale.module';
import { LocalizePipe } from 'projects/laji/src/app/locale/localize.pipe';
import { BaRoutingModule } from './routing.module';
import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { LajiApiClientModule } from '../../../laji-api-client/src/public-api';
import { Configuration } from 'projects/laji-api-client/src/lib/configuration';
import { environment } from '../env/environment';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';
import { TechnicalNewsDumbModule } from 'projects/laji/src/app/shared-modules/technical-news/technical-news-dumb/technical-news-dumb.module';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDatatableModule } from '@achimha/ngx-datatable';
import { API_BASE_URL, LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { PlatformLocation } from '@angular/common';
import moment from 'moment';

export function detectLangFromPath(pathname: string, langs = ['en', 'sv'], defaultLang = 'fi') {
  const langFromPath = pathname.split('/').filter(Boolean)[0]?.toLowerCase();
  if (langs.includes(langFromPath)) {
    return langFromPath;
  }
  return defaultLang;
}

const appInitializer = async () => {
  const platformLocation = inject(PlatformLocation);
  const translate = inject(TranslateService);
  const api = inject(LajiApiClientBService);

  const path = platformLocation.pathname;
  const lang = detectLangFromPath(path);

  api.setLang(lang);
  translate.setFallbackLang('fi');
  moment.locale(lang);
  if (window?.document?.documentElement?.lang) {
    window.document.documentElement.lang = lang;
  }

  return translate.use(lang);
};

@NgModule({ exports: [],
  bootstrap: [AppComponent],
  declarations: [AppComponent, NotFoundComponent, NavbarComponent, LocalizePipe, FooterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    LocaleModule,
    BaRoutingModule,
    LajiApiClientModule.forRoot(() => new Configuration({ accessToken: undefined, apiKeys: {}, basePath: environment.lajiApiBasePath })),
    TechnicalNewsDumbModule,
    CoreModule,
    NgxDatatableModule
  ],
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiBase },
    provideAppInitializer(appInitializer),
    LocalizeRouterService,
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxWebstorage(
  		withNgxWebstorageConfig({ prefix: 'ba-', separator: '' }),
  		withLocalStorage(),
  		withSessionStorage()
    ),
  ]
})
export class AppModule { }

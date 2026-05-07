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
import { environment } from '../env/environment';
import { LocalizeRouterService } from 'projects/laji/src/app/locale/localize-router.service';
import { TechnicalNewsDumbModule } from 'projects/laji/src/app/shared-modules/technical-news/technical-news-dumb/technical-news-dumb.module';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDatatableModule } from '@achimha/ngx-datatable';
import { API_BASE_URL } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { PlatformLocation } from '@angular/common';
import { setLocale } from 'projects/laji/src/app/locale/locale.component';
import { detectLangFromPath } from 'projects/laji/src/app/app.module';

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
    TechnicalNewsDumbModule,
    CoreModule,
    NgxDatatableModule
  ],
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiBase },
    provideAppInitializer(() => {
      const platformLocation = inject(PlatformLocation);
      const translate = inject(TranslateService);

      const path = platformLocation.pathname;
      const lang = detectLangFromPath(path);

      translate.setFallbackLang('fi');
      return setLocale(lang);
    }),
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

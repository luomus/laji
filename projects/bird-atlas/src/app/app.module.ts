import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
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

@NgModule({ exports: [],
  bootstrap: [AppComponent],
  declarations: [AppComponent, NotFoundComponent, NavbarComponent, LocalizePipe, FooterComponent], imports: [BrowserModule,
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
    NgxDatatableModule],
  providers: [
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

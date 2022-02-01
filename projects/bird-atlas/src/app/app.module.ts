import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { LazyTranslateLoader } from './locale/lazy-translate-loader';
import { NotFoundComponent } from 'projects/laji/src/app/shared/not-found/not-found.component';
import { LocaleModule } from 'projects/laji/src/app/locale/locale.module';
import { BaRoutingModule } from './routing.module';
import { NgtUniversalModule } from '@ng-toolkit/universal';
import { NgxWebstorageModule } from 'ngx-webstorage';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    NgtUniversalModule,
    NgxWebstorageModule.forRoot({prefix: 'laji-', separator: ''}),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    LocaleModule,
    BaRoutingModule
  ],
  exports: [
  ],
  providers: [],
  bootstrap: [AppComponent],
  declarations: [AppComponent, NotFoundComponent]
})
export class AppModule { }

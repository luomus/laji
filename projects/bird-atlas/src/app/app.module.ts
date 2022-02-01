import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { LazyTranslateLoader } from './locale/lazy-translate-loader';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from 'projects/laji/src/app/shared/not-found/not-found.component';
import { LocaleFiComponent } from 'projects/laji/src/app/locale/locale-fi.component';
import { LocaleEnComponent } from 'projects/laji/src/app/locale/locale-en.component';
import { LocaleSvComponent } from 'projects/laji/src/app/locale/locale-sv.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ModalModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    RouterModule
  ],
  exports: [
  ],
  providers: [],
  bootstrap: [AppComponent],
  declarations: [AppComponent, NotFoundComponent, LocaleFiComponent, LocaleEnComponent, LocaleSvComponent]
})
export class AppModule { }

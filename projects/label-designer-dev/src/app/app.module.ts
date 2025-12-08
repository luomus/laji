import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LabelDesignerModule } from '../../../label-designer/src/lib/label-designer.module';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { LazyTranslateLoader } from './lazy-translate-loader';
import { HttpClientModule } from '@angular/common/http';
import { NgxWebstorageModule } from 'ngx-webstorage';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LabelDesignerModule,
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: LazyTranslateLoader
      }
    }),
    NgxWebstorageModule.forRoot({prefix: 'label-designer-dev-', separator: ''}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

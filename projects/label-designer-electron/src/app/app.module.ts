import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { HttpClientModule } from '@angular/common/http';
import { LabelDesignerModule } from '../../../label-designer/src/lib/label-designer.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxWebstorageModule.forRoot({prefix: 'LM-', separator: ''}),
    LabelDesignerModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

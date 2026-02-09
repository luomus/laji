import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { provideNgxWebstorage, withNgxWebstorageConfig, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LabelDesignerModule } from '../../../label-designer/src/lib/label-designer.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    LabelDesignerModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideNgxWebstorage(
  		withNgxWebstorageConfig({ prefix: 'LM-', separator: '' }),
  		withLocalStorage(),
  		withSessionStorage()
    ),
  ] })
export class AppModule { }

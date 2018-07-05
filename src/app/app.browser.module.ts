import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TransferHttpCacheModule } from '@nguniversal/common';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({appId: 'laji-app'}),
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    // There is a bug that prevent's sending request on browser when only query parameter changes
    // TransferHttpCacheModule,,
    AppModule,

  ]
})
export class AppBrowserModule {
}

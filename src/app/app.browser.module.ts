import { AppComponent } from './shared-modules/app-component/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({appId: 'laji-app'}),
    BrowserTransferStateModule
  ]
})
export class AppBrowserModule {
}

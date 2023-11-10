import { AppComponent } from './shared-modules/app-component/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
    BrowserAnimationsModule
  ]
})
export class AppBrowserModule {
}

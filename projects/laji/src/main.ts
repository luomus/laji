import { AppBrowserModule } from './app/app.browser.module';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppBrowserModule, { applicationProviders: [provideZoneChangeDetection()], })
  .catch(err => console.log(err));

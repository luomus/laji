import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { IucnModule } from './app/iucn.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(IucnModule, { applicationProviders: [provideZoneChangeDetection()], })
  .catch(err => console.error(err));

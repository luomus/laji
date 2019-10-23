import * as moment from 'moment';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const now = moment();
console.log(now);

export { AppServerModule } from './app/app.server.module';

// Express Engine
export { ngExpressEngine } from '@nguniversal/express-engine';

// Import module map for lazy loading
export { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import { renderModuleFactory } from '@angular/platform-server';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

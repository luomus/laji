import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

import { AppServerModule } from './app/app.server.module';
export default AppServerModule;

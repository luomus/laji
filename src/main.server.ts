import { enableProdMode } from '@angular/core';

export { ngExpressEngine } from '@nguniversal/express-engine';
export { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
export { renderModuleFactory } from '@angular/platform-server';
export { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';

export { AppServerModule } from './app/app.server.module';

enableProdMode();

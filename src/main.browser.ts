import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS, Http } from '@angular/http';
//import { enableProdMode } from '@angular/core';
import { PLATFORM_PIPES } from '@angular/core';

import {TRANSLATE_PROVIDERS, TranslatePipe } from 'ng2-translate/ng2-translate';

import { APP_ROUTER_PROVIDERS } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { NewsApi } from './app/shared'

//enableProdMode();

bootstrap(AppComponent, [
  disableDeprecatedForms(),
  provideForms(),
  HTTP_PROVIDERS,
  APP_ROUTER_PROVIDERS,
  { provide: LocationStrategy, useClass: PathLocationStrategy },
  TRANSLATE_PROVIDERS,
  NewsApi,
  { provide: PLATFORM_PIPES, useValue: TranslatePipe, multi: true }
])
.catch(err => console.error(err));

import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { FORM_DIRECTIVES }   from '@angular/forms';
import { disableDeprecatedForms, provideForms } from '@angular/forms';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS, Http } from '@angular/http';
//import { enableProdMode } from '@angular/core';
import { PLATFORM_PIPES } from '@angular/core';

import {TRANSLATE_PROVIDERS, TranslatePipe } from 'ng2-translate/ng2-translate';

import { APP_ROUTER_PROVIDERS } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { NewsApi, UserService } from './app/shared'
import {PersonTokenApi} from "./app/shared/api/PersonTokenApi";
import {PersonApi} from "./app/shared/api/PersonApi";
import {MetadataApi} from "./app/shared/api/MetadataApi";
import {TriplestoreLabelService} from "./app/shared/service/triplestore-label.service";
import {WarehouseValueMappingService} from "./app/shared/service/warehouse-value-mapping.service";
import {WarehouseApi} from "./app/shared/api/WarehouseApi";
import {LabelPipe} from "./app/shared/pipe/label.pipe";

//enableProdMode();

bootstrap(AppComponent, [
  disableDeprecatedForms(),
  provideForms(),
  HTTP_PROVIDERS,
  FORM_DIRECTIVES,
  APP_ROUTER_PROVIDERS,
  { provide: LocationStrategy, useClass: PathLocationStrategy },
  TRANSLATE_PROVIDERS,
  PersonTokenApi,
  PersonApi,
  UserService,
  MetadataApi,
  WarehouseApi,
  TriplestoreLabelService,
  WarehouseValueMappingService,
  { provide: PLATFORM_PIPES, useValue: LabelPipe, multi: true },
  { provide: PLATFORM_PIPES, useValue: TranslatePipe, multi: true }
])
.catch(err => console.error(err));

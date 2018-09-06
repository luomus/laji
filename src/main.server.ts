import * as moment from 'moment';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import './extensions';

if (environment.production) {
  enableProdMode();
}

const now = moment();
console.log(now);

export {AppServerModule} from './app/app.server.module';

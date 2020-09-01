import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/fi';
import { PlatformService } from '../shared/service/platform.service';

@Component({
  selector: 'laji-locale-fi',
  template: '<router-outlet></router-outlet>'
})
export class LocaleFiComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService
  ) {
    super(platformService);
    moment.locale('fi');
    this.setLocale('fi');
  }
}

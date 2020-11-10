import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import { PlatformService } from '../shared/service/platform.service';

@Component({
  selector: 'laji-locale-en',
  template: '<router-outlet></router-outlet>'
})
export class LocaleEnComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService
  ) {
    super(platformService);
    moment.locale('en');
    this.setLocale('en');
  }
}

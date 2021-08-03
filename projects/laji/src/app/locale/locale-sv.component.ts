import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/sv';
import localeSv from '@angular/common/locales/sv';
import { PlatformService } from '../shared/service/platform.service';
import { registerLocaleData } from '@angular/common';

@Component({
  selector: 'laji-locale-sv',
  template: '<router-outlet></router-outlet>'
})
export class LocaleSvComponent extends LocaleComponent {

  constructor(
    protected platformService: PlatformService
  ) {
    super(platformService);
    moment.locale('sv');
    registerLocaleData(localeSv);
    this.setLocale('sv');
  }

}

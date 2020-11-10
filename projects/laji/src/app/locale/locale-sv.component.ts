import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/sv';
import { PlatformService } from '../shared/service/platform.service';

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
    this.setLocale('sv');
  }

}

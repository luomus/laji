import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import * as moment from 'moment';
import 'moment/locale/zh-tw';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

@Component({
  selector: 'bsg-locale-zh',
  template: '<router-outlet></router-outlet>'
})
export class LocaleZhComponent extends LocaleComponent {

  constructor(
    protected platformService: PlatformService
  ) {
    super(platformService);
    moment.locale('zh-tw');
    this.setLocale('zh');
  }

}

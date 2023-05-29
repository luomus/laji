import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import * as moment from 'moment';
import 'moment/locale/es';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

@Component({
  selector: 'bsg-locale-es',
  template: '<router-outlet></router-outlet>'
})
export class LocaleEsComponent extends LocaleComponent {

  constructor(
    protected platformService: PlatformService
  ) {
    super(platformService);
    moment.locale('es');
    this.setLocale('es');
  }

}

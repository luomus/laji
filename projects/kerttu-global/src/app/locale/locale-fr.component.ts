import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import * as moment from 'moment';
// import 'moment/locale/fr';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

@Component({
  selector: 'bsg-locale-fr',
  template: '<router-outlet></router-outlet>'
})
export class LocaleFrComponent extends LocaleComponent {

  constructor(
    protected platformService: PlatformService
  ) {
    super(platformService);
    // moment.locale('fr');
    this.setLocale('fr');
  }

}

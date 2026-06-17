import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';
import 'moment/locale/es';

@Component({
    selector: 'bsg-locale-es',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleEsComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
  ) {
    super(platformService, 'es');
  }

}

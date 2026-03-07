import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';
import 'moment/locale/fr';

@Component({
    selector: 'bsg-locale-fr',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleFrComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
  ) {
    super(platformService, 'fr');
  }

}

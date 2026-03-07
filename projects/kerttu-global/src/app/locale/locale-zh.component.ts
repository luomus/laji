import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';
import 'moment/locale/zh-tw';

@Component({
    selector: 'bsg-locale-zh',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleZhComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
  ) {
    super(platformService, 'zh');
  }

}

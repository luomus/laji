import { Component } from '@angular/core';
import { LocaleComponent } from 'projects/laji/src/app/locale/locale.component';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import 'moment/locale/es';

@Component({
    selector: 'bsg-locale-es',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleEsComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
    translate: TranslateService,
    api: LajiApiClientBService,
  ) {
    super(platformService, translate, api, 'es');
  }

}

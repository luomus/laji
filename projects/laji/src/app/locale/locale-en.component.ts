import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import { PlatformService } from '../root/platform.service';
import { TranslateService } from '@ngx-translate/core';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
    selector: 'laji-locale-en',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleEnComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
    translate: TranslateService,
    api: LajiApiClientBService,
  ) {
    super(platformService, translate, api, 'en');
  }
}

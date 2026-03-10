import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import { PlatformService } from '../root/platform.service';

@Component({
    selector: 'laji-locale-fi',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleFiComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
  ) {
    super(platformService, 'fi');
  }
}

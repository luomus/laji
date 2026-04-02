import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import { PlatformService } from '../root/platform.service';

@Component({
    selector: 'laji-locale-sv',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleSvComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
  ) {
    super(platformService, 'sv');
  }

}

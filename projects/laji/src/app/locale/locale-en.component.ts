import { Component } from '@angular/core';
import { LocaleComponent } from './locale.component';
import { PlatformService } from '../root/platform.service';

@Component({
    selector: 'laji-locale-en',
    template: '<router-outlet></router-outlet>',
    standalone: false
})
export class LocaleEnComponent extends LocaleComponent {

  constructor(
    platformService: PlatformService,
  ) {
    super(platformService, 'en');
  }
}

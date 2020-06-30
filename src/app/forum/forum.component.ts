import { Component } from '@angular/core';
import { PlatformService } from '../shared/service/platform.service';

@Component({
  selector: 'laji-foorum',
  template: ' ',
})
export class ForumComponent {

  constructor(
    private platformService: PlatformService
  ) {
    if (this.platformService.isBrowser) {
      window.location.href = 'http://foorumi.laji.fi/';
    }
  }
}

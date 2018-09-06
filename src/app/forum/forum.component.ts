import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-foorum',
  template: ' ',
})
export class ForumComponent {

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object
  ) {
    if (isPlatformBrowser(this.platformID)) {
      this.window.location.href = 'http://foorumi.laji.fi/';
    }
  }
}

import { WINDOW } from '@ng-toolkit/universal';
import { Component , Inject} from '@angular/core';

@Component({
  selector: 'laji-foorum',
  template: ' ',
})
export class ForumComponent {

  constructor(@Inject(WINDOW) private window: Window) {
    this.window.location.href = 'http://foorumi.laji.fi/';
  }
}

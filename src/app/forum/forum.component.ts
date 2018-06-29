import { WINDOW } from '@ng-toolkit/universal';
import { Component , Inject} from '@angular/core';
import { WindowRef } from '../shared/windows-ref';

@Component({
  selector: 'laji-foorum',
  template: ' ',
})
export class ForumComponent {

  constructor(@Inject(WINDOW) private window: Window,private windowRef: WindowRef) {
    this.windowRef.nativeWindow.location.href = 'http://foorumi.laji.fi/';
  }
}

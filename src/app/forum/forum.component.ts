import { Component } from '@angular/core';
import { WindowRef } from '../shared/windows-ref';

@Component({
  selector: 'laji-foorum',
  template: ' ',
})
export class ForumComponent {

  constructor(private windowRef: WindowRef) {
    this.windowRef.nativeWindow.location.href = 'http://foorumi.laji.fi/';
  }
}

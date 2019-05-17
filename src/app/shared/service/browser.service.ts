import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { PlatformService } from './platform.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  private visibilitySubject = new Subject<boolean>();

  visibility$ = this.visibilitySubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: any,
    platformService: PlatformService
  ) {
    if (!platformService.isBrowser) {
      return;
    }
    this.initVisibilityListener();
  }

  initVisibilityListener() {
    let hidden, visibilityChange;
    if (typeof this.document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof this.document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof this.document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    const handleVisibilityChange = () => {
      this.visibilitySubject.next(!this.document[hidden]);
    };
    try {
      this.document.addEventListener(visibilityChange, handleVisibilityChange, false);
    } catch (e) {}

  }
}

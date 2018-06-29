import { Injectable } from '@angular/core';

function _window(): any {
  return window || {};
}

@Injectable({providedIn: 'root'})
export class WindowRef {
  /**
   * @deprecated Use WINDOW token provided by ng-toolkit/universal instead
   * @returns {any}
   */
  get nativeWindow(): any {
    return _window();
  }
}

import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class FooterService {
  private _footerVisible = true;

  set footerVisible(visible) {
    if (visible !== this._footerVisible) {
      this._footerVisible = visible;
    }
  }

  get footerVisible() {
    return this._footerVisible;
  }
}

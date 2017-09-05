import { Injectable } from '@angular/core';

@Injectable()
export class FooterService {
  private _footerVisible = true;
  private _footerContainer = 'col-sm-12';

  set footerVisible(visible) {
    if (visible !== this._footerVisible) {
      this._footerVisible = visible;
    }
  }

  get footerVisible() {
    return this._footerVisible;
  }

  set footerContainer(cls: string) {
    this._footerContainer = cls || 'col-sm-12';
  }

  get footerContainer() {
    return this._footerContainer;
  }
}

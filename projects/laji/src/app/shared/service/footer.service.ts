import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class FooterService {
  private _footerVisible = true;
  public footerVisible$ = new BehaviorSubject<boolean>(this._footerVisible);

  set footerVisible(visible: boolean) {
    if (visible !== this._footerVisible) {
      this._footerVisible = visible;
      this.footerVisible$.next(visible);
    }
  }

  get footerVisible() {
    return this._footerVisible;
  }
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NavbarService {
  private _navbarVisible = true;
  public navbarVisible$ = new Subject<boolean>();

  set navbarVisible(visible: boolean) {
    if (visible !== this._navbarVisible) {
      this._navbarVisible = visible;
      this.navbarVisible$.next(visible);
    }
  }

  get navbarVisible() {
    return this._navbarVisible;
  }
}

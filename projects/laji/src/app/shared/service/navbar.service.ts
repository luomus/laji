import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavbarService {
  navbarVisible$ = new BehaviorSubject(true);

  set navbarVisible(v) {
    this.navbarVisible$.next(v);
  }

  get navbarVisible() {
    return this.navbarVisible$.value;
  }
}

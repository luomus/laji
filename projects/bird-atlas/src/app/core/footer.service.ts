import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class FooterService {
  private showSubject = new BehaviorSubject<boolean>(false);
  show$ = this.showSubject.asObservable();
  toggle(b: boolean) {
    this.showSubject.next(b);
  }
}

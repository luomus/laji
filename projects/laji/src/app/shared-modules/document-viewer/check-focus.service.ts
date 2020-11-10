import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckFocusService {

  constructor() { }

  private childGenerateEvent = new BehaviorSubject<boolean>(false);

  emitChildEvent(value: boolean) {
     this.childGenerateEvent.next(value);
  }

  childEventListner() {
    return this.childGenerateEvent.asObservable();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReloadObservationViewService {

  private childGenerateEvent = new BehaviorSubject<boolean>(false);

  emitChildEvent(value: boolean) {
     this.childGenerateEvent.next(value);
  }

  childEventListner() {
    return this.childGenerateEvent.asObservable();
  }


}

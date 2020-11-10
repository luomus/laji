import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteOwnDocumentService {

  constructor() { }

  private childGenerateEvent = new BehaviorSubject<string>(null);

  emitChildEvent(value: string) {
     this.childGenerateEvent.next(value);
  }

  childEventListner() {
    return this.childGenerateEvent.asObservable();
  }


}

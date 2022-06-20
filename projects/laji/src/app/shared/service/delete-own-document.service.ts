import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteOwnDocumentService {

  private childGenerateEvent = new BehaviorSubject<string | null>(null);

  emitChildEvent(value: string) {
     this.childGenerateEvent.next(value);
  }

  childEventListner() {
    return this.childGenerateEvent.asObservable();
  }


}

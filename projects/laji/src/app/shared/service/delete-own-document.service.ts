import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeleteOwnDocumentService {

  private childGenerateEvent = new BehaviorSubject<string | null | undefined>(null);

  emitChildEvent(value: string|null|undefined) {
     this.childGenerateEvent.next(value);
  }

  childEventListner() {
    return this.childGenerateEvent.asObservable();
  }


}

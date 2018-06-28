import { Injectable } from '@angular/core';
import { Observable ,  Observer } from 'rxjs';
import { WindowRef } from '../windows-ref';

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(private windowRef: WindowRef) { }

  confirm(messsage: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      observer.next(this.windowRef.nativeWindow.confirm(messsage));
      observer.complete();
    });
  }

}

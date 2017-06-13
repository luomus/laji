import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WindowRef } from '../windows-ref';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class DialogService {

  constructor(private windowRef: WindowRef) { }

  confirm(messsage: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      observer.next(this.windowRef.nativeWindow.confirm(messsage));
      observer.complete();
    });
  }

}

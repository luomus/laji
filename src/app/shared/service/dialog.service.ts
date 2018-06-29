import { WINDOW } from '@ng-toolkit/universal';
import { Inject, Injectable } from '@angular/core';
import { Observable ,  Observer } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(@Inject(WINDOW) private window: Window) { }

  confirm(messsage: string): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      observer.next(this.window.confirm(messsage));
      observer.complete();
    });
  }

}

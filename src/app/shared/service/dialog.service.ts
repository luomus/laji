import { WINDOW } from '@ng-toolkit/universal';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, Observer, of as ObservableOf } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object
  ) { }

  confirm(messsage: string, onServer = false): Observable<boolean> {
    if (!isPlatformBrowser(this.platformID)) {
      return ObservableOf(onServer);
    }
    return Observable.create((observer: Observer<boolean>) => {
      observer.next(this.window.confirm(messsage));
      observer.complete();
    });
  }

}

import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { PlatformService } from './platform.service';

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(
    private platformService: PlatformService
  ) { }

  confirm(message: string, onServer = false): Observable<boolean> {
    if (this.platformService.isServer) {
      return ObservableOf(onServer);
    }
    return new Observable((subscriber) => {
      subscriber.next(window.confirm(message));
      subscriber.complete();
    });
  }

  prompt(message: string, _default?: string): Observable<string> {
    return new Observable((subscriber) => {
      subscriber.next(window.prompt(message, _default));
      subscriber.complete();
    });
  }

}

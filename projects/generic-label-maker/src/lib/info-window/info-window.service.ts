import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface IInfoWindow {
  title?: string;
  content: string;
  actionTypes: 'ok'|'yesno'|'close';
}

@Injectable({
  providedIn: 'root'
})
export class InfoWindowService {

  private visibilitySource = new BehaviorSubject<boolean>(false);
  private dataSource = new BehaviorSubject<IInfoWindow>({content: '', actionTypes: 'ok'});
  private closeSubject;

  open(data: IInfoWindow) {
    this.dataSource.next(data);
    this.visibilitySource.next(true);
    this.closeSubject = new Subject();
    return this.closeSubject.asObservable();
  }

  close(value?: any) {
    this.visibilitySource.next(false);
    this.closeSubject.emit(value);
  }

  visiblilityAsObservable() {
    return this.visibilitySource.asObservable();
  }

  dataAsObservable() {
    return this.dataSource.asObservable();
  }
}

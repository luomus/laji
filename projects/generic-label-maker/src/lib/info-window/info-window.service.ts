import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface IInfoWindow {
  title?: string;
  content: string | TemplateRef<any>;
  actions?: TemplateRef<any>;
  actionTypes?: 'ok'|'yesNo'|'close';
}

@Injectable({
  providedIn: 'root'
})
export class InfoWindowService {

  private visibilitySource = new BehaviorSubject<boolean>(false);
  private dataSource = new BehaviorSubject<IInfoWindow>({content: '', actionTypes: 'ok'});
  private closeSubject: Subject<any>;

  open(data: IInfoWindow) {
    this.dataSource.next(data);
    this.visibilitySource.next(true);
    this.closeSubject = new Subject();
    return this.closeSubject.asObservable();
  }

  close(value?: any) {
    this.closeSubject.next(value);
    this.visibilitySource.next(false);
  }

  visibilityAsObservable() {
    return this.visibilitySource.asObservable();
  }

  dataAsObservable() {
    return this.dataSource.asObservable();
  }
}

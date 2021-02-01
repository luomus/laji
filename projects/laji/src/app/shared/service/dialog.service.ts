import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf, Subject } from 'rxjs';
import { PlatformService } from './platform.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from './confirm.component';

@Injectable({providedIn: 'root'})
export class DialogService {

  confirmSub: Subject<boolean>;

  constructor(
    private platformService: PlatformService,
    private modalService: BsModalService,
  ) { }

  confirm(message: string, onServer = false): Observable<boolean> {
    if (this.platformService.isServer) {
      return ObservableOf(onServer);
    }
    this.confirmSub = new Subject();
    const modalRef = this.modalService.show(ConfirmModalComponent, {backdrop: 'static', keyboard: false});
    this.modalService.config.backdrop = 'static';
    this.modalService.config.keyboard = false;
    modalRef.content.message = message;
    modalRef.content.confirm.subscribe(() => {
      this.modalService.hide(modalRef.id);
      this.confirmSub.next(true);
      this.confirmSub.complete();
    });
    modalRef.content.cancel.subscribe(() => {
      this.modalService.hide(modalRef.id);
      this.confirmSub.next(false);
      this.confirmSub.complete();
    });
    modalRef.content.cdr.markForCheck();
    return this.confirmSub;
  }

  prompt(message: string, _default?: string): Observable<string> {
    return new Observable((subscriber) => {
      subscriber.next(window.prompt(message, _default));
      subscriber.complete();
    });
  }

}

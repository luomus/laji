import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf, Subject } from 'rxjs';
import { PlatformService } from './platform.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmComponent } from './confirm.component';

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(
    private platformService: PlatformService,
    private modalService: BsModalService,
  ) { }

  confirm(message: string, onServer = false): Observable<boolean> {
    if (this.platformService.isServer) {
      return ObservableOf(onServer);
    }
    return this.createDialog(message);
  }

  prompt(message: string, _default?: string): Observable<string> {
    return this.createDialog(message, true, _default);
  }

  private createDialog(message: string): Subject<boolean>;
  private createDialog(message: string, prompt: true, promptDefault?: string): Subject<string | null>;
  private createDialog(message: string, prompt = false, promptDefault?: string): Subject<boolean | (string | null)> {
    const subject = new Subject<unknown>();
    const modalRef = this.modalService.show(ConfirmComponent, {backdrop: 'static'});
    modalRef.content.message = message;
    modalRef.content.prompt = prompt;
    modalRef.content.promptValue = promptDefault ?? '';

    modalRef.content.confirm.subscribe((value?: string) => {
      this.modalService.hide(modalRef.id);
      subject.next(prompt ? value : true);
      subject.complete();
    });

    const cancel = () => {
      this.modalService.hide(modalRef.id);
      subject.next(prompt ? null : false);
      subject.complete();
    };
    modalRef.content.cancel.subscribe(cancel);
    modalRef.onHide.subscribe(cancel);
    modalRef.content.cdr.markForCheck();
    return prompt
      ? subject as Subject<string | null>
      : subject as Subject<boolean>;
  }
}

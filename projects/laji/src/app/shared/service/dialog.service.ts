import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { PlatformService } from './platform.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from './confirm-modal.component';
import { map, take } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(
    private platformService: PlatformService,
    private modalService: BsModalService,
  ) { }

  confirm(message: string, confirmLabel?: string, onServer = false): Observable<boolean> {
    if (this.platformService.isServer) {
      return ObservableOf(onServer);
    }
    return this.createDialog(message, confirmLabel);
  }

  prompt(message: string, confirmLabel?: string, _default?: string): Observable<string | null> {
    return this.createDialog(message, confirmLabel, true, _default);
  }

  private createDialog(message: string, confirmLabel?: string): Observable<boolean>;
  private createDialog(message: string, confirmLabel: string | undefined, prompt: true, promptDefault?: string): Observable<string | null>;
  private createDialog(message: string, confirmLabel?: string, prompt = false, promptDefault?: string): Observable<boolean | string | null> {
    const initialState = {message, prompt, promptValue: promptDefault ?? ''} as any;
    if (typeof confirmLabel === 'string') {
      initialState.confirmLabel = confirmLabel;
    }
    const modalRef = this.modalService.show(ConfirmModalComponent, {
      backdrop: 'static',
      class: 'modal-sm',
      initialState
    });

    return modalRef.onHide.pipe(
      map(() => modalRef.content.value),
      take(1)
    );
  }
}

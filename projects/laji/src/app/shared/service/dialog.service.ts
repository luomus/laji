import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { PlatformService } from '../../root/platform.service';
import { ConfirmModalComponent } from './confirm-modal.component';
import { tap } from 'rxjs/operators';
import { ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

interface DialogConfig {
  message: string;
  promptValue?: string;
  showCancel?: boolean;
  prompt?: boolean;
  confirmLabel?: string;
}

interface AlertConfig extends Pick<DialogConfig, 'message'> {
  showCancel: false;
}

interface ConfirmConfig extends Pick<DialogConfig, 'message' | 'confirmLabel'> {
  showCancel: true;
}

interface PromptConfig extends Pick<DialogConfig, 'message' | 'confirmLabel' | 'promptValue'> {
  showCancel: true;
  prompt: true;
}

interface InitialState extends DialogConfig {
  promptValue: string;
}

@Injectable({providedIn: 'root'})
export class DialogService {

  constructor(
    private platformService: PlatformService,
    private modalService: ModalService,
  ) { }

  alert(message: string, onServer = true): Observable<boolean> {
    if (this.platformService.isServer) {
      return ObservableOf(onServer);
    }
    return this.createDialog<AlertConfig, boolean>({message, showCancel: false});
  }

  confirm(message: string, confirmLabel?: string, onServer = false): Observable<boolean> {
    if (this.platformService.isServer) {
      return ObservableOf(onServer);
    }
    return this.createDialog<ConfirmConfig, boolean>({message, showCancel: true, confirmLabel});
  }

  prompt(message: string, confirmLabel?: string, _default?: string): Observable<string | null> {
    return this.createDialog<PromptConfig, string | null>({message, showCancel: true, confirmLabel, prompt: true, promptValue: _default});
  }

  private createDialog<T extends DialogConfig, R = boolean | string | null>(options: T): Observable<R> {
    if (options.confirmLabel === undefined) {
      delete options.confirmLabel;
    }
    if (options.promptValue === undefined) {
      delete options.promptValue;
    }
    const confirm = new EventEmitter<any>();
    const initialState: InitialState = {showCancel: true, prompt: false, promptValue: '', confirm, ...options};
    const modal = this.modalService.show(ConfirmModalComponent, {
        noClose: true,
        size: 'sm',
        initialState
    });

    // subscribe so that the client of this method doesn't have to if they don't care about the result.
    const confirmPipe = confirm.pipe(tap(() => modal.hide()));
    confirmPipe.subscribe();
    return confirmPipe;
  }
}

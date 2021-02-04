import {
  Component,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  template: `
    <div class="modal-body">
      <p class="laji-dialog-message">{{ message | translate }}</p>
      <input *ngIf="prompt" #prompt
             class="form-control"
             (keyup)="onPromptChange(prompt.value)"
             (keyup.enter)="onConfirm()" />
    </div>
    <div class="modal-footer">
      <button tabIndex="1" type="button" class="btn btn-secondary laji-dialog-cancel" (click)="onCancel()">{{ cancelLabel | translate }}</button>
      <button tabIndex="1" type="button" class="btn btn-primary laji-dialog-confirm" (click)="onConfirm()">{{ confirmLabel | translate }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent implements OnInit {

  message: string;
  confirmLabel = 'OK';
  cancelLabel = 'cancel';
  prompt = false;
  promptValue = '';

  value: boolean | string | null;

  constructor(private modalRef: BsModalRef) { }

  ngOnInit() {
    this.value = this.prompt ? null : false;
  }

  onConfirm() {
    this.value = this.prompt ? this.promptValue : true;
    this.modalRef.hide();
  }

  onCancel() {
    this.modalRef.hide();
  }

  onPromptChange(value) {
    this.promptValue = value;
  }
}

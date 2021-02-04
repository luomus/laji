import {
  Component,
  ChangeDetectionStrategy,
  OnInit, ViewChild, ElementRef, AfterViewInit
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
      <button type="button"
              class="btn btn-secondary laji-dialog-cancel"
              (click)="onCancel()"
              (keyup.enter)="onCancel()">{{ cancelLabel | translate }}</button>
      <button type="button" #confirm
              class="btn btn-primary laji-dialog-confirm"
              (click)="onConfirm()"
              (keyup.enter)="onConfirm()">{{ confirmLabel | translate }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent implements OnInit, AfterViewInit {

  message: string;
  confirmLabel = 'OK';
  cancelLabel = 'cancel';
  prompt = false;
  promptValue = '';

  value: boolean | string | null;

  @ViewChild('confirm') confirmElem: ElementRef;

  constructor(private modalRef: BsModalRef) { }

  ngOnInit() {
    this.value = this.prompt ? null : false;
  }

  ngAfterViewInit() {
    setTimeout(() => this.confirmElem.nativeElement.focus());
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

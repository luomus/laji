import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  template: `
    <p class="laji-dialog-message" [innerHTML]="message | translate"></p>
    <input *ngIf="prompt" #prompt
           class="form-control"
           (keyup)="onPromptChange(prompt.value)"
           (keyup.enter)="onConfirm()" />
    <div class="lu-modal-footer">
      <button type="button" #confirm
              class="btn btn-primary laji-dialog-confirm"
              (click)="onConfirm()">{{ confirmLabel | translate }}</button>
      <button type="button" *ngIf="showCancel"
              class="btn btn-default laji-dialog-cancel"
              (click)="onCancel()">{{ cancelLabel | translate }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent implements AfterViewInit {

  message!: string;
  confirmLabel = 'OK';
  cancelLabel = 'cancel';
  prompt = false;
  promptValue = '';
  showCancel = true;

  @Output() confirm = new EventEmitter<any>();

  @ViewChild('confirm') confirmElem!: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => this.confirmElem.nativeElement.focus());
  }

  onConfirm() {
    this.confirm.emit(this.prompt ? this.promptValue : true);
    this.confirm.complete();
  }

  onCancel() {
    this.confirm.emit(this.prompt ? null : false);
    this.confirm.complete();
  }

  onPromptChange(value: string) {
    this.promptValue = value;
  }
}

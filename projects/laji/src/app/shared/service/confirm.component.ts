import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef, AfterViewInit
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'laji-confirm',
  template: `
    <div #modal class="modal-body">
      <p>{{ message | translate }}</p>
      <input *ngIf="prompt" #prompt
             class="form-control"
             (keyup)="onPromptChange(prompt.value)"
             (keyup.enter)="onConfirm()" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="onCancel()">{{ cancelLabel | translate }}</button>
      <button type="button" class="btn btn-primary" (click)="onConfirm()">{{ confirmLabel | translate }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {

  @Input() message: string;
  @Input() confirmLabel = 'OK';
  @Input() cancelLabel = 'cancel';
  @Input() prompt = false;
  @Input() promptValue = '';

  @Output() confirm = new EventEmitter();
  @Output() cancel = new EventEmitter();

  @ViewChild('modal', { static: true }) modal: ModalDirective;

  constructor(public cdr: ChangeDetectorRef) {
  }

  onConfirm() {
    this.confirm.emit(this.prompt ? this.promptValue : undefined);
  }

  onCancel() {
    this.cancel.emit();
  }

  onPromptChange(value) {
    this.promptValue = value;
  }
}

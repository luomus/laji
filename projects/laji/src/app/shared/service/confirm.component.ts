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
  selector: 'laji-confirm-modal',
  template: `
    <div #modal class="modal-body">
      <p>{{ message | translate }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="onCancel()">{{ cancelLabel | translate }}</button>
      <button type="button" class="btn btn-primary" (click)="onConfirm()">{{ confirmLabel | translate }}</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModalComponent {

  @Input() message: string;
  @Input() confirmLabel = 'OK';
  @Input() cancelLabel = 'cancel';

  @Output() confirm = new EventEmitter();
  @Output() cancel = new EventEmitter();

  @ViewChild('modal', { static: true }) modal: ModalDirective;

  constructor(public cdr: ChangeDetectorRef) {
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}

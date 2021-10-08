import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

export interface ApiKeyRequest {
  reason: string;
  reasonEnum: string;
}

@Component({
  selector: 'laji-apikey-modal',
  templateUrl: './apikey-modal.component.html',
  styleUrls: ['./apikey-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApikeyModalComponent implements OnChanges {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() apiKey = '';

  private _reason = '';
  private _reasonEnum = '';
  set reason(reason: string) {
    this._reason = reason;
    this.updateDisableRequestBtn();
  }
  get reason() { return this._reason; }
  set reasonEnum(reasonEnum: string) {
    this._reasonEnum = reasonEnum;
    this.updateDisableRequestBtn();
  }
  get reasonEnum() { return this._reasonEnum; }

  disableRequestBtn = true;
  termsAccepted = false;

  private modalRef: BsModalRef;

  @Output() request = new EventEmitter<ApiKeyRequest>();

  constructor(private modalService: BsModalService, private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.updateDisableRequestBtn();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {backdrop: false, class: 'modal-sm'});
  }

  onClose() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  onRequest() {
    if (this.disableRequestBtn) {
      return;
    }
    this.request.emit({reason: this.reason, reasonEnum: this.reasonEnum});
  }

  onCopyToClipboard() {
    navigator.clipboard.writeText(this.apiKey);
  }

  private updateDisableRequestBtn() {
    this.disableRequestBtn = this.loading || (!this.reason || !this.reasonEnum);
    this.cdr.markForCheck();
  }
}

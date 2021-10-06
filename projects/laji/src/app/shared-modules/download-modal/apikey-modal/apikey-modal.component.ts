import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  TemplateRef
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

interface ApiKeyRequest {
  reason: string;
  reasonEnum: string;
}

@Component({
  selector: 'laji-apikey-modal',
  templateUrl: './apikey-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApikeyModalComponent implements OnChanges {
  @Input() disabled = false;
  @Input() loading = false;

  reason = '';
  reasonEnum = '';
  disableRequestBtn = false;

  private modalRef: BsModalRef;

  @Output() request = new EventEmitter<ApiKeyRequest>();

  constructor(private modalService: BsModalService) {}

  ngOnChanges() {
    this.disableRequestBtn = this.loading || (!this.reason || !this.reasonEnum);
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
}

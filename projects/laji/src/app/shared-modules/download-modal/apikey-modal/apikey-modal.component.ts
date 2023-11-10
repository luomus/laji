import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

export interface ApiKeyRequest {
  reason: string;
  reasonEnum: string;
  expiration: number;
}

@Component({
  selector: 'laji-apikey-modal',
  templateUrl: './apikey-modal.component.html',
  styleUrls: ['./apikey-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApikeyModalComponent implements OnChanges, OnInit {
  @Input() disabled = false;
  @Input() loading = false;
  @Input() apiKey = '';

  @ViewChild('modal', {static: true}) modal: ModalComponent;

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
  expiration = 90;
  modalShown = false;

  @Output() request = new EventEmitter<ApiKeyRequest>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.modal.onShownChange.subscribe(shown => {this.modalShown = shown;});
  }

  ngOnChanges() {
    this.updateDisableRequestBtn();
  }

  openModal() {
    this.modal.show();
  }

  onRadioInput(event, value: number) {
    if (event.target?.checked) {
      this.expiration = value;
      this.cdr.markForCheck();
    }
  }

  onRequest() {
    if (this.disableRequestBtn) {
      return;
    }
    this.request.emit({reason: this.reason, reasonEnum: this.reasonEnum, expiration: this.expiration});
  }

  private updateDisableRequestBtn() {
    this.disableRequestBtn = this.loading || (!this.reason || !this.reasonEnum);
    this.cdr.markForCheck();
  }
}

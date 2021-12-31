import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IDownloadRequest } from '../../../service/vir-download-requests.service';

@Component({
  selector: 'vir-download-request-modal',
  template: `
    <ng-container *ngIf="downloadRequest">
      <div class="modal-header">
        <button type="button" class="close" (click)="close.emit()">
          <i class="glyphicon glyphicon-remove"></i>
        </button>
        <h4 class="modal-title">{{ (downloadRequest.downloadType === 'AUTHORITIES_API_KEY' ? 'usage.apiKey' : 'usage.fileDownload') | translate }} {{ downloadRequest.id | toFullUri }}</h4>
      </div>
      <div class="modal-body">
        <vir-download-request
          [downloadRequest]="downloadRequest"
          [showPerson]="showPerson"
          [showFileDownload]="showFileDownload"
        ></vir-download-request>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DownloadRequestModalComponent {
  @Input() downloadRequest?: IDownloadRequest;
  @Input() showPerson = true;
  @Input() showFileDownload = false;

  @Output() close = new EventEmitter();
}

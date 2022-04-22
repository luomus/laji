import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DownloadRequest } from '../../../../../../laji/src/app/shared-modules/download-request/models';

@Component({
  selector: 'vir-download-request-modal',
  template: `
    <ng-container *ngIf="downloadRequest">
      <div class="modal-header">
        <button type="button" class="close" (click)="close.emit()">
          <i class="glyphicon glyphicon-remove"></i>
        </button>
        <h4 class="modal-title">{{ (
          downloadRequest.downloadType === 'AUTHORITIES_API_KEY' ? 'downloadRequest.apiKey' : 'downloadRequest.fileDownload'
        ) | translate }} {{ downloadRequest.id | toFullUri }}</h4>
      </div>
      <div class="modal-body">
        <laji-download-request
          [downloadRequest]="downloadRequest"
          [showPerson]="showPerson"
          [showFileDownload]="showFileDownload"
        ></laji-download-request>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DownloadRequestModalComponent {
  @Input() downloadRequest?: DownloadRequest;
  @Input() showPerson = true;
  @Input() showFileDownload = false;

  @Output() close = new EventEmitter();
}

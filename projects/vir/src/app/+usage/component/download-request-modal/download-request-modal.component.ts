import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { DownloadRequest } from '../../../../../../laji/src/app/shared-modules/download-request/models';

@Component({
  selector: 'vir-download-request-modal',
  template: `
    <ng-container *ngIf="downloadRequest">
      <h4>{{ (
        downloadRequest.downloadType === 'AUTHORITIES_API_KEY' ? 'downloadRequest.apiKey' : 'downloadRequest.fileDownload'
      ) | translate }} {{ downloadRequest.id | toFullUri }}</h4>
      <laji-download-request
        [downloadRequest]="downloadRequest"
        [showPerson]="showPerson"
        [showDownload]="showFileDownload ? 'always' : 'never'"
      ></laji-download-request>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DownloadRequestModalComponent {
  @Input() downloadRequest?: DownloadRequest;
  @Input() showPerson = true;
  @Input() showFileDownload = false;
}

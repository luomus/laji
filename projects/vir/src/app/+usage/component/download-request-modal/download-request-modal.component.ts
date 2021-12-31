import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IDownloadRequest } from '../../../service/vir-download-requests.service';

@Component({
  selector: 'vir-download-request-modal',
  template: `
    <ng-container *ngIf="downloadRequest">
      <div class="modal-header">
        <button type="button" class="close" (click)="close.emit()">
          <i class="glyphicon glyphicon-remove"></i>
        </button>
        <h4 class="modal-title">{{ 'usage.fileDownload' | translate }} {{ downloadRequest.id | toFullUri }}</h4>
      </div>
      <div class="modal-body">
        <vir-download-request
          [downloadRequest]="downloadRequest"
          [showPerson]="true"
        ></vir-download-request>
      </div>
    </ng-container>
  `
})

export class DownloadRequestModalComponent {
  @Input() downloadRequest?: IDownloadRequest;

  @Output() close = new EventEmitter();
}

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { GeoapiKeyRequest } from '../../../service/vir-geoapi.service';

@Component({
  selector: 'vir-geoapi-key-request-modal',
  template: `
    <ng-container *ngIf="geoapiKeyRequest">
      <h4>{{ 'downloadRequest.geoapiKey' | translate }}</h4>
      <laji-download-request-basic-info
        [downloadRequest]="geoapiKeyRequest"
        [showPerson]="showPerson"
        [downloadRequestType]="'apiKey'"
      ></laji-download-request-basic-info>
      <ng-container *ngIf="showFileDownload">
        <h4>{{ 'downloadRequest.copyApiKey' | translate }}</h4>
        <laji-copy-to-clipboard
          *ngIf="showFileDownload"
          [value]="geoapiKeyRequest.apiKey"
          [wrapText]="true"
        ></laji-copy-to-clipboard>
      </ng-container>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GeoapiKeyRequestModalComponent {
  @Input() geoapiKeyRequest?: GeoapiKeyRequest;
  @Input() showPerson = true;
  @Input() showFileDownload = false;
}

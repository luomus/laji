import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { DownloadRequestResponse, isDownloadRequest, asDownloadRequest } from '../shared-modules/download-request/models';

@Component({
  template: `
    <div class="container laji-page" style="padding-bottom: 20px; padding-top: 20px;" *ngIf="downloadRequest$ | async as downloadRequest">
      <ng-container *ngIf="isDownloadRequest(downloadRequest) else notFound">
        <laji-download-request
          [downloadRequest]="asDownloadRequest(downloadRequest)"
          [showTitle]="true"
          [showDownload]="'publicOnly'"
        ></laji-download-request>
      </ng-container>
      <ng-template #notFound>
        {{ 'downloadRequest.notFound' | translate:{ id } }}
      </ng-template>
    </div>
  `,
  selector: 'laji-citable-download',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CitableDownloadComponent implements OnInit {
  downloadRequest$: Observable<DownloadRequestResponse>;
  id: string;

  isDownloadRequest = isDownloadRequest;
  asDownloadRequest = asDownloadRequest;

  constructor(
    private route: ActivatedRoute,
    private warehouseApi: WarehouseApi
  ) { }

  ngOnInit() {
    this.downloadRequest$ = this.route.params.pipe(
      map(params => params['id']),
      tap(id => { this.id = id; }),
      switchMap(id => this.warehouseApi.downloads(id))
    );
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { WarehouseApi } from '../shared/api/WarehouseApi';
import { DownloadRequestResponse, isDownloadRequest, asDownloadRequest } from '../shared-modules/download-request/models';
import { HeaderService } from '../shared/service/header.service';
import { TranslateService } from '@ngx-translate/core';

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
    private warehouseApi: WarehouseApi,
    private headerService: HeaderService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.downloadRequest$ = this.route.params.pipe(
      map(params => params['id']),
      tap(id => { this.id = id; }),
      switchMap(id => this.warehouseApi.downloads(id)),
      tap(response => this.updateHeaders(response))
    );
  }

  updateHeaders(response: DownloadRequestResponse) {
    const key = (
      response.found &&
      response.downloadType === 'AUTHORITIES_API_KEY'
    ) ? 'downloadRequest.apiKey' : 'downloadRequest.fileDownload';

    const title = this.translate.instant(key);

    this.headerService.setHeaders({
      title: title + ' | ' + this.headerService.getInferred().title
    });
  }
}

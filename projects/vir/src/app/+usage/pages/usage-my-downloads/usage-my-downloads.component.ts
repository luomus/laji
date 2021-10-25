import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { finalize, map, take, tap } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'vir-usage-my-downloads',
  template: `
    <div class="container mt-6 laji-page">
      <laji-spinner [spinning]="requestsTableLoading" [overlay]="true">
        <h3 translate>usage.downloads</h3>
        <vir-data-table
          type="user"
          [height]="'50vh'"
          [data]="downloadRequests$ | async"
          [showDownloadMenu]="false"
          class="d-block my-5"
        ></vir-data-table>
      </laji-spinner>
      <laji-spinner [spinning]="keysTableLoading" [overlay]="true">
        <h3 translate>usage.apikeys</h3>
        <vir-data-table
          type="userKeys"
          [height]="'50vh'"
          [data]="apiKeys$ | async"
          [showDownloadMenu]="false"
          class="d-block my-5"
        ></vir-data-table>
      </laji-spinner>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageMyDownloadsComponent {
  requestsTableLoading = false;
  keysTableLoading = false;

  downloadRequests$: Observable<IDownloadRequest[]>;
  apiKeys$: Observable<IDownloadRequest[]>;
  constructor(
    private virDownloadRequestsService: VirDownloadRequestsService,
    private cdr: ChangeDetectorRef
  ) {
    this.requestsTableLoading = true;
    this.keysTableLoading = true;
    this.downloadRequests$ = this.virDownloadRequestsService.findMyDownloadRequests().pipe(
      take(1),
      finalize(() => {
        this.requestsTableLoading = false;
        this.cdr.markForCheck();
      })
    );
    this.apiKeys$ = this.virDownloadRequestsService.findMyApiKeys().pipe(
      map(downloads => downloads.sort((a, b) => moment(b.requested).diff(moment(a.requested)))),
      map(res => res.map(a => ({...a, collectionIds: a.collections.map(c => c.id)}))),
      take(1),
      finalize(() => {
        this.keysTableLoading = false;
        this.cdr.markForCheck();
      })
    );
  }
}

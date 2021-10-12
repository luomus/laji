import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-my-downloads',
  template: `
    <div class="container mt-6">
      <laji-spinner [spinning]="requestsTableLoading" [overlay]="true">
        <vir-data-table
          type="user"
          [height]="'50vh'"
          [data]="downloadRequests$ | async"
          [showDownloadMenu]="false"
          class="d-block my-5"
        ></vir-data-table>
      </laji-spinner>
      <laji-spinner [spinning]="keysTableLoading" [overlay]="true">
        <vir-data-table
          type="apiKeys"
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
  apiKeys$: Observable<any[]>;
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
      take(1),
      finalize(() => {
        this.keysTableLoading = false;
        this.cdr.markForCheck();
      })
    );
  }
}

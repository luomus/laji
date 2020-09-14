import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-my-downloads',
  template: `
    <div class="container mt-6">
      <laji-spinner [spinning]="loading" [overlay]="true">
        <vir-data-table
          type="user"
          [data]="downloadRequests$ | async"
          [showDownloadMenu]="false"
        ></vir-data-table>
      </laji-spinner>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageMyDownloadsComponent {
  loading = false;

  downloadRequests$: Observable<IDownloadRequest[]>;
  constructor(
    private virDownloadRequestsService: VirDownloadRequestsService,
    private cdr: ChangeDetectorRef
  ) {
    this.loading = true;
    this.downloadRequests$ = this.virDownloadRequestsService.findMyDownloadRequests().pipe(
      take(1),
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    );
  }
}

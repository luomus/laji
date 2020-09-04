import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-my-downloads',
  templateUrl: './usage-my-downloads.component.html',
  styleUrls: ['./usage-my-downloads.component.scss'],
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
      finalize(() => {
        this.loading = false;
        this.cdr.markForCheck();
      })
    );
  }
}

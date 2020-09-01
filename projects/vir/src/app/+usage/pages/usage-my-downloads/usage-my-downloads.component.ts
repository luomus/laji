import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';

@Component({
  selector: 'vir-usage-my-downloads',
  templateUrl: './usage-my-downloads.component.html',
  styleUrls: ['./usage-my-downloads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageMyDownloadsComponent {

  downloadRequests$: Observable<IDownloadRequest[]>;
  constructor(
    private virDownloadRequestsService: VirDownloadRequestsService
  ) {
    this.downloadRequests$ = this.virDownloadRequestsService.findMyDownloadRequests();
  }
}

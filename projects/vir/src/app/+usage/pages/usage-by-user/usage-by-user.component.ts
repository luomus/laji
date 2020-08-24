import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';

@Component({
  selector: 'vir-usage-by-user',
  templateUrl: './usage-by-user.component.html',
  styleUrls: ['./usage-by-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageByUserComponent {

  downloadRequests$: Observable<IDownloadRequest[]>;
  constructor(
    private virDownloadRequestsService: VirDownloadRequestsService
  ) {
    this.downloadRequests$ = this.virDownloadRequestsService.findMyDownloadRequests();
  }
}

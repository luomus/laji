import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'vir-usage-by-collection',
  templateUrl: './usage-by-collection.component.html',
  styleUrls: ['./usage-by-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageByCollectionComponent {
  downloadRequests$: Observable<IDownloadRequest[]>;
  constructor(
      private virDownloadRequestsService: VirDownloadRequestsService
  ) {
    this.downloadRequests$ = this.virDownloadRequestsService.findDownloadRequests();
  }

  select(event: any) {
    // TODO: open modal to...
  }
}

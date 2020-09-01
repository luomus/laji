import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IDownloadRequest, VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { Observable } from 'rxjs';
import { PlatformService } from '../../../../../../../src/app/shared/service/platform.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'vir-usage-by-collection',
  templateUrl: './usage-downloads.component.html',
  styleUrls: ['./usage-downloads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageDownloadsComponent {
  downloadRequests$: Observable<IDownloadRequest[]>;
  constructor(
      private virDownloadRequestsService: VirDownloadRequestsService,
      private platformService: PlatformService
  ) {
    this.downloadRequests$ = this.virDownloadRequestsService.findDownloadRequests();
  }

  collectionSelect(col: string) {
    this.downloadRequests$ = this.virDownloadRequestsService.findDownloadRequests().pipe(
      map(downloads => col ? downloads.filter(d => d?.rootCollections.includes(col)) : downloads)
    );
  }

  onRowClick(event: any) {
    if (this.platformService.isBrowser) {
      window.open('http://tun.fi/' + (event.row.id.replace('http://tun.fi/', '')), '_blank');
    }
  }
}

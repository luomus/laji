import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DownloadRequest } from '../../../../../../laji/src/app/shared-modules/download-request/models';

@Component({
  selector: 'vir-usage-by-collection',
  templateUrl: './usage-downloads.component.html',
  styleUrls: ['./usage-downloads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageDownloadsComponent {
  @ViewChild('downloadModal', { static: true }) downloadModal: TemplateRef<any>;
  downloadRequests$: Observable<DownloadRequest[]>;
  apiKeys$: Observable<DownloadRequest[]>;

  selectedRequest?: DownloadRequest;

  private modal: BsModalRef;

  constructor(
      private modalService: BsModalService,
      private virDownloadRequestsService: VirDownloadRequestsService
  ) {
    this.collectionSelect(undefined);
  }

  collectionSelect(col: string) {
    this.downloadRequests$ = this.virDownloadRequestsService.findDownloadRequests().pipe(
      map(downloads => col ? downloads.filter(d => d?.collectionSearch.includes(col)) : downloads),
      map(downloads => downloads.map(download => ({...download, collectionIds: download.collections?.map(collection => collection.id)})))
    );
    this.apiKeys$ = this.virDownloadRequestsService.findApiKeys().pipe(
      map(downloads => col ? downloads.filter(d => d?.collectionSearch.includes(col)) : downloads),
      map(downloads => downloads.sort((a, b) => moment(b.requested).diff(moment(a.requested)))),
      map(res => res.map(a => ({...a, collectionIds: a.collections?.map(c => c.id) || []})))
    );
  }

  onRowClick(event: any) {
    this.openDownloadModal(event.row);
  }

  openDownloadModal(request: DownloadRequest) {
    this.selectedRequest = request;
    this.modal = this.modalService.show(this.downloadModal, {class: 'modal-md'});
  }

  closeDownloadModal() {
    this.modal?.hide();
    this.selectedRequest = null;
  }
}

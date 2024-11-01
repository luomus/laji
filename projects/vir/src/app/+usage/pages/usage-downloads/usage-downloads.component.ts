import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { DownloadRequest } from '../../../../../../laji/src/app/shared-modules/download-request/models';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';
import { GeoapiKeyRequest, VirGeoapiService } from '../../../service/vir-geoapi.service';

@Component({
  selector: 'vir-usage-by-collection',
  templateUrl: './usage-downloads.component.html',
  styleUrls: ['./usage-downloads.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageDownloadsComponent {
  @ViewChild('downloadModal', { static: true }) downloadModal: TemplateRef<any>;
  @ViewChild('geoapiKeyModal', { static: true }) geoapiKeyModal: TemplateRef<any>;
  downloadRequests$: Observable<DownloadRequest[]>;
  apiKeys$: Observable<DownloadRequest[]>;
  geoapiKeys$: Observable<GeoapiKeyRequest[]>;

  selectedRequest?: DownloadRequest;
  selectedGeoapiKeyRequest?: GeoapiKeyRequest;

  private modal: ModalRef;

  constructor(
      private modalService: ModalService,
      private virDownloadRequestsService: VirDownloadRequestsService,
      private geoapiService: VirGeoapiService
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
    this.geoapiKeys$ = this.geoapiService.findApiKeys().pipe(
      map(downloads => downloads.sort((a, b) => moment(b.requested).diff(moment(a.requested))))
    );
  }

  openDownloadModal(request: DownloadRequest) {
    this.selectedRequest = request;
    this.modal = this.modalService.show(this.downloadModal);
  }

  openGeoapiKeyModal(request: GeoapiKeyRequest) {
    this.selectedGeoapiKeyRequest = request;
    this.modal = this.modalService.show(this.geoapiKeyModal);
  }

  closeModal() {
    this.modal?.hide();
    this.selectedRequest = null;
    this.selectedGeoapiKeyRequest = null;
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { VirDownloadRequestsService } from '../../../service/vir-download-requests.service';
import { finalize, map, take } from 'rxjs/operators';
import * as moment from 'moment';
import { DownloadRequest } from '../../../../../../laji/src/app/shared-modules/download-request/models';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

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
          [showRowAsLink]="true"
          (rowSelect)="openDownloadModal($event.row)"
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
          [showRowAsLink]="true"
          (rowSelect)="openDownloadModal($event.row)"
          class="d-block my-5"
        ></vir-data-table>
      </laji-spinner>
    </div>
    <ng-template #downloadModal>
      <vir-download-request-modal
        [downloadRequest]="selectedRequest"
        [showPerson]="false"
        [showFileDownload]="true"
        (close)="closeModal()"
      ></vir-download-request-modal>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsageMyDownloadsComponent {
  @ViewChild('downloadModal', { static: true }) downloadModal!: TemplateRef<any>;

  requestsTableLoading = false;
  keysTableLoading = false;

  downloadRequests$: Observable<DownloadRequest[]>;
  apiKeys$: Observable<DownloadRequest[]>;

  selectedRequest: DownloadRequest | null = null;

  private modal: ModalRef | undefined;

  constructor(
    private modalService: ModalService,
    private virDownloadRequestsService: VirDownloadRequestsService,
    private cdr: ChangeDetectorRef
  ) {
    this.requestsTableLoading = true;
    this.keysTableLoading = true;
    this.downloadRequests$ = this.virDownloadRequestsService.findMyDownloadRequests().pipe(
      take(1),
      map(downloads => downloads.map(download => ({...download, collectionIds: download.collections?.map(collection => collection.id)}))),
      finalize(() => {
        this.requestsTableLoading = false;
        this.cdr.markForCheck();
      })
    );
    this.apiKeys$ = this.virDownloadRequestsService.findMyApiKeys().pipe(
      map(downloads => downloads.sort((a, b) => moment(b.requested).diff(moment(a.requested)))),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map(res => res.map(a => ({...a, collectionIds: a.collections!.map(c => c.id)}))),
      take(1),
      finalize(() => {
        this.keysTableLoading = false;
        this.cdr.markForCheck();
      })
    );
  }

  openDownloadModal(request: DownloadRequest) {
    this.selectedRequest = request;
    this.modal = this.modalService.show(this.downloadModal, { size: 'lg' });
  }

  closeModal() {
    this.modal?.hide();
    this.selectedRequest = null;
  }
}

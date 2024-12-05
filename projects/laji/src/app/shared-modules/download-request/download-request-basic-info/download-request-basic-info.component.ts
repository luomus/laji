import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DownloadRequest, DownloadRequestType } from '../models';

@Component({
  selector: 'laji-download-request-basic-info',
  templateUrl: './download-request-basic-info.component.html',
  styleUrls: ['./download-request-basic-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadRequestBasicInfoComponent {
  @Input() downloadRequest: Partial<DownloadRequest>;
  @Input() showPerson = false;
  @Input() downloadRequestType: DownloadRequestType = 'fileDownload';
}

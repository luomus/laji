import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DownloadRequest } from '../models';

@Component({
  selector: 'laji-download-request',
  templateUrl: './download-request.component.html',
  styleUrls: ['./download-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadRequestComponent {
  @Input() downloadRequest: DownloadRequest;
  @Input() showPerson = false;
  @Input() showFileDownload = false;
  @Input() showTitle = false;
}

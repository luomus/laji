import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IDownloadRequest } from '../../../service/vir-download-requests.service';

@Component({
  selector: 'vir-download-request',
  templateUrl: './download-request.component.html',
  styleUrls: ['./download-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadRequestComponent {
  @Input() downloadRequest: IDownloadRequest;
  @Input() showPerson = false;
  @Input() showFileDownload = false;

}

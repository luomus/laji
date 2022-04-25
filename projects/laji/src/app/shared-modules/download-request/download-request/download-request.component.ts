import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DownloadRequest } from '../models';
import { toHtmlInputElement } from '../../../shared/service/html-element.service';

@Component({
  selector: 'laji-download-request',
  templateUrl: './download-request.component.html',
  styleUrls: ['./download-request.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadRequestComponent {
  @Input() downloadRequest: DownloadRequest;
  @Input() showPerson = false;
  @Input() showDownload: 'always'|'publicOnly'|'never' = 'never';
  @Input() showTitle = false;

  selectInput(event: Event) {
    toHtmlInputElement(event.target).select();
  }
}

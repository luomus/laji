import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FileCrs, FileFormat, FileGeometry, FileType, VirDownloadService } from '../../../service/vir-download.service';
import { IDownloadRequest } from '../../../service/vir-download-requests.service';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'vir-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileDownloadComponent {
  @Input() downloadRequest: IDownloadRequest;

  fileTypeEnum = FileType;
  fileFormatEnum = FileFormat;
  fileGeometryEnum = FileGeometry;
  fileCrsEnum = FileCrs;

  constructor(
    public downloadService: VirDownloadService,
    private cdr: ChangeDetectorRef
  ) {
    this.downloadService.fileDownloadReady.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  downloadFile() {
    this.downloadService.downloadFile(this.downloadRequest.id);
  }

  sortNull = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { FileType, VirDownloadService } from '../../../service/vir-download.service';
import { IDownloadRequest } from '../../../service/vir-download-requests.service';
import { KeyValue } from '@angular/common';
import { GEO_CONVERT_LIMIT, FileFormat, FileGeometry, FileCrs } from '../../../../../../laji/src/app/shared/service/geo-convert.service';

@Component({
  selector: 'vir-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileDownloadComponent implements OnChanges {
  @Input() downloadRequest: IDownloadRequest;

  gisDownloadLimit = GEO_CONVERT_LIMIT;
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

  ngOnChanges() {
    if (this.downloadRequest?.approximateMatches > this.gisDownloadLimit && this.downloadService.fileType === this.fileTypeEnum.gis) {
      this.downloadService.fileType = this.fileTypeEnum.standard;
    }
  }

  downloadFile() {
    this.downloadService.downloadFile(this.downloadRequest.id);
  }

  sortNull = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  }
}

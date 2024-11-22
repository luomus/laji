import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { FileType, FileDownloadService } from '../file-download.service';
import { DownloadRequest } from '../models';
import { KeyValue } from '@angular/common';
import { GEO_CONVERT_LIMIT, FileFormat, FileGeometry, FileCrs } from '../../../shared/service/geo-convert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileDownloadComponent implements OnChanges, OnDestroy {
  @Input() downloadRequest!: DownloadRequest;

  gisDownloadLimit = GEO_CONVERT_LIMIT;
  fileTypeEnum = FileType;
  fileFormatEnum = FileFormat;
  fileGeometryEnum = FileGeometry;
  fileCrsEnum = FileCrs;

  private fileDownloadStateChangeSub: Subscription;

  constructor(
    public downloadService: FileDownloadService,
    private cdr: ChangeDetectorRef
  ) {
    this.fileDownloadStateChangeSub = this.downloadService.fileDownloadStateChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnChanges() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.downloadRequest?.approximateMatches! > this.gisDownloadLimit && this.downloadService.fileType === this.fileTypeEnum.gis) {
      this.downloadService.fileType = this.fileTypeEnum.standard;
    }
  }

  ngOnDestroy() {
    this.fileDownloadStateChangeSub?.unsubscribe();
  }

  downloadFile() {
    this.downloadService.downloadFile(this.downloadRequest.id, this.downloadRequest.publicDownload);
  }

  sortNull = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => 0;
}

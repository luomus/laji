import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';
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

  fileType: FileType = FileType.standard;
  format: FileFormat = FileFormat.shp;
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;

  loading = false;

  fileTypeEnum = FileType;
  fileFormatEnum = FileFormat;
  fileGeometryEnum = FileGeometry;
  fileCrsEnum = FileCrs;

  constructor(
    @Inject(WINDOW) private window: Window,
    private downloadService: VirDownloadService,
    private cdr: ChangeDetectorRef
  ) { }

  downloadFile() {
    this.loading = true;

    this.downloadService.getDownloadLink(this.downloadRequest.id, this.fileType, this.format, this.geometry, this.crs).subscribe(res => {
      this.window.location.href = res;
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  sortNull = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  }
}

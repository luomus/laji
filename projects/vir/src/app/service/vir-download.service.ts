import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { WINDOW } from '@ng-toolkit/universal';
import { DialogService } from '../../../../laji/src/app/shared/service/dialog.service';
import {
  FileFormat,
  FileGeometry,
  FileCrs,
  GeoConvertService,
  isGeoConvertError
} from '../../../../laji/src/app/shared/service/geo-convert.service';

export enum FileType {
  standard = 'standard',
  gis = 'gis'
}

@Injectable({providedIn: 'root'})
export class VirDownloadService {
  fileType: FileType = FileType.standard;
  format: FileFormat = FileFormat.shp;
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;
  loading = false;

  fileDownloadReady = new EventEmitter();

  constructor(
    @Inject(WINDOW) private window: Window,
    private httpClient: HttpClient,
    private userService: UserService,
    private dialogService: DialogService,
    private geoConvertService: GeoConvertService
  ) {}

  downloadFile(id: string) {
    this.loading = true;
    this.getDownloadLink(id, this.fileType, this.format, this.geometry, this.crs).subscribe(res => {
      this.window.location.href = res;
      this.loading = false;
      this.fileDownloadReady.emit();
    }, err => {
      const msg = isGeoConvertError(err) ? err.msg : 'usage.fileDownload.genericError';
      this.dialogService.alert(msg);
      this.loading = false;
      this.fileDownloadReady.emit();
    });
  }

  private getDownloadLink(id: string, type: FileType, format?: FileFormat, geometry?: FileGeometry, crs?: FileCrs): Observable<string> {
    if (type === FileType.gis) {
      return this.geoConvertService.getGISDownloadLink(id, format, geometry, crs);
    } else {
      return of('/api/warehouse/download/secured/' + id + '?personToken=' + this.userService.getToken());
    }
  }
}

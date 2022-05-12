import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, first, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../shared/service/user.service';
import { WINDOW } from '@ng-toolkit/universal';
import { DialogService } from '../../shared/service/dialog.service';
import {
  FileFormat,
  FileGeometry,
  FileCrs,
  GeoConvertService,
  isGeoConvertError
} from '../../shared/service/geo-convert.service';
import { environment } from '../../../environments/environment';

export enum FileType {
  standard = 'standard',
  gis = 'gis'
}

@Injectable({providedIn: 'root'})
export class FileDownloadService {
  fileType: FileType = FileType.standard;
  format: FileFormat = FileFormat.shp;
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;
  loading = false;
  progressPercentage?: number;

  fileDownloadReady = new EventEmitter();
  fileDownloadProgressChange = new EventEmitter();

  constructor(
    @Inject(WINDOW) private window: Window,
    private httpClient: HttpClient,
    private userService: UserService,
    private dialogService: DialogService,
    private geoConvertService: GeoConvertService
  ) {}

  downloadFile(id: string, isPublic = false) {
    this.loading = true;
    this.progressPercentage = 0;

    this.getDownloadLink(id, isPublic, this.fileType, this.format, this.geometry, this.crs).subscribe(res => {
      this.window.location.href = res;
      this.loading = false;
      this.progressPercentage = null;
      this.fileDownloadReady.emit();
    }, err => {
      const msg = isGeoConvertError(err) ? err.msg : 'downloadRequest.fileDownload.genericError';
      this.dialogService.alert(msg);
      this.loading = false;
      this.progressPercentage = null;
      this.fileDownloadReady.emit();
    });
  }

  private getDownloadLink(
    id: string, isPublic: boolean, type: FileType, format?: FileFormat, geometry?: FileGeometry, crs?: FileCrs
  ): Observable<string> {
    const personToken = isPublic ? null : this.userService.getToken();
    if (type === FileType.gis) {
      return this.geoConvertService.geoConvertFile(id, format, geometry, crs, personToken).pipe(
        tap(response => {
          this.progressPercentage = response.progressPercent;
          this.fileDownloadProgressChange.emit();
        }),
        first(response => response.status === 'complete'),
        map(response => response.outputLink)
      );
    } else {
      let downloadLink = environment.apiBase + '/warehouse/download/';
      downloadLink += isPublic ? id : ('secured/' + id + '?personToken=' + personToken);
      return of(downloadLink);
    }
  }
}

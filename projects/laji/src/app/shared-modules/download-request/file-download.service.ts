import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { tap, first, map } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { DialogService } from '../../shared/service/dialog.service';
import {
  FileFormat,
  FileGeometry,
  FileCrs,
  GeoConvertService,
  isGeoConvertError
} from '../../shared/service/geo-convert.service';
import { environment } from '../../../environments/environment';
import { PlatformService } from '../../root/platform.service';

export enum FileType {
  standard = 'standard',
  gis = 'gis'
}

@Injectable({providedIn: 'root'})
export class FileDownloadService {
  fileType: FileType = FileType.standard;
  format: FileFormat = FileFormat.gpkg;
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;
  loading = false;
  progressPercentage?: number;

  private fileDownloadStateChangeSubject = new Subject<void>();
  fileDownloadStateChange = this.fileDownloadStateChangeSubject.asObservable();

  constructor(
    private platformService: PlatformService,
    private userService: UserService,
    private dialogService: DialogService,
    private geoConvertService: GeoConvertService
  ) {}

  downloadFile(id: string, isPublic = false) {
    this.loading = true;
    this.progressPercentage = undefined;

    this.getDownloadLink(id, isPublic, this.fileType, this.format, this.geometry, this.crs).subscribe(res => {
      this.platformService.window.location.href = res;
      this.loading = false;
      this.progressPercentage = undefined;
      this.fileDownloadStateChangeSubject.next();
    }, err => {
      const msg = isGeoConvertError(err) ? err.msg : 'downloadRequest.fileDownload.genericError';
      this.dialogService.alert(msg);
      this.loading = false;
      this.progressPercentage = undefined;
      this.fileDownloadStateChangeSubject.next();
    });
  }

  private getDownloadLink(
    id: string, isPublic: boolean, type: FileType, format: FileFormat, geometry: FileGeometry, crs: FileCrs
  ): Observable<string> {
    const personToken = isPublic ? null : this.userService.getToken();
    if (type === FileType.gis) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.geoConvertService.geoConvertFile(id, format, geometry, crs, personToken!).pipe(
        tap(response => {
          this.progressPercentage = response.progressPercent;
          this.fileDownloadStateChangeSubject.next();
        }),
        first(response => response.status === 'complete'),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(response => response.outputLink!)
      );
    } else {
      let downloadLink = environment.apiBase + '/warehouse/download/';
      downloadLink += isPublic ? id : ('secured/' + id + '?personToken=' + personToken);
      return of(downloadLink);
    }
  }
}

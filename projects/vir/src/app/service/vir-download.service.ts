import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Observable, interval, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, mergeMap, first, map } from 'rxjs/operators';
import { UserService } from '../../../../laji/src/app/shared/service/user.service';
import { WINDOW } from '@ng-toolkit/universal';

export enum FileType {
  standard = 'standard',
  gis = 'gis'
}
export enum FileFormat {
  shp = 'shp',
  gpkg = 'gpkg'
}
export enum FileGeometry {
  point = 'point',
  bbox = 'bbox',
  footprint = 'footprint'
}
export enum FileCrs {
  euref = 'euref',
  wgs84 = 'wgs84'
}
interface GeoConversionStatus {
  id: string;
  status: 'pending'|'complete';
}

@Injectable({providedIn: 'root'})
export class VirDownloadService {
  fileType: FileType = FileType.standard;
  format: FileFormat = FileFormat.shp;
  geometry: FileGeometry = FileGeometry.point;
  crs: FileCrs = FileCrs.euref;
  loading = false;

  fileDownloadReady = new EventEmitter();

  private pollInterval = 5000;

  constructor(
    @Inject(WINDOW) private window: Window,
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  downloadFile(id: string) {
    this.loading = true;
    this.getDownloadLink(id, this.fileType, this.format, this.geometry, this.crs).subscribe(res => {
      this.window.location.href = res;
      this.loading = false;
      this.fileDownloadReady.emit();
    });
  }

  private getDownloadLink(id: string, type: FileType, format?: FileFormat, geometry?: FileGeometry, crs?: FileCrs): Observable<string> {
    if (type === FileType.gis) {
      return this.getGISDownloadLink(id, format, geometry, crs);
    } else {
      return of('/api/warehouse/download/secured/' + id + '?personToken=' + this.userService.getToken());
    }
  }

  private getGISDownloadLink(fileId: string, format: string, geometry: string, crs: string): Observable<string> {
    return this.startGeoConversion(fileId, format, geometry, crs).pipe(
      switchMap(conversionId => {
        return interval(this.pollInterval).pipe(
          mergeMap(() => this.getGeoConversionStatus(conversionId)),
          first(result => result.status === 'complete'),
          map(() => '/api/geo-convert/output/' + conversionId)
        );
      })
    );
  }

  private startGeoConversion(fileId: string, format: string, geometry: string, crs: string): Observable<string> {
    const fileNumber = parseInt(fileId.split('.')[1], 10);

    const queryParams = {
      'personToken': this.userService.getToken(),
      'outputFormat': format,
      'geometryType': geometry,
      'crs': crs
    };
    const params = new HttpParams({fromObject: <any>queryParams});

    return this.httpClient.get<string>('/api/geo-convert/' + fileNumber, {params: params});
  }

  private getGeoConversionStatus(conversionId: string): Observable<GeoConversionStatus> {
    return this.httpClient.get<GeoConversionStatus>('/api/geo-convert/status/' + conversionId);
  }
}

import { Injectable } from '@angular/core';
import { Observable, interval, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, mergeMap, first, map, catchError } from 'rxjs/operators';
import { UserService } from './user.service';
import { TranslateService } from '@ngx-translate/core';

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
export enum ErrorType {
  tooComplex = 'too_complex',
  notSupported = 'not_supported',
  geometryNotAvailable = 'geometry_not_available'
}
export interface GeoConvertError {
  isGeoConvertError: true,
  type: ErrorType,
  msg: string
}
export function isGeoConvertError(err: GeoConvertError|any): err is GeoConvertError {
  return err.isGeoConvertError;
}

@Injectable({providedIn: 'root'})
export class GeoConvertService {
  private pollInterval = 5000;

  constructor(
    private httpClient: HttpClient,
    private userService: UserService,
    private translate: TranslateService
  ) {}

  public getGISDownloadLink(fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs): Observable<string> {
    return this.startGeoConversion(fileId, format, geometry, crs).pipe(
      switchMap(conversionId => this.getOutputLink(conversionId)),
      catchError(err => {
        return this.transformError(err);
      })
    );
  }

  public getGISDownloadLinkFromData(
    data: FormData, fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs
  ): Observable<string> {
    return this.startGeoConversionFromData(data, fileId, format, geometry, crs).pipe(
      switchMap(conversionId => this.getOutputLink(conversionId)),
      catchError(err => {
        return this.transformError(err);
      })
    );
  }

  private startGeoConversion(fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs): Observable<string> {
    const queryParams = {
      personToken: this.userService.getToken(),
      outputFormat: format,
      geometryType: geometry,
      crs
    };
    const params = new HttpParams({fromObject: <any>queryParams});

    return this.httpClient.get<string>('/api/geo-convert/' + fileId, {params});
  }

  private startGeoConversionFromData(
    data: FormData, fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs
  ): Observable<string> {
    const queryParams = {
      outputFormat: format,
      geometryType: geometry,
      crs
    };
    const params = new HttpParams({fromObject: <any>queryParams});

    return this.httpClient.post<string>('/api/geo-convert/' + fileId, data, {params});
  }

  private getOutputLink(conversionId: string) {
    return interval(this.pollInterval).pipe(
      mergeMap(() => this.getGeoConversionStatus(conversionId)),
      first(result => result.status === 'complete'),
      map(() => '/api/geo-convert/output/' + conversionId)
    );
  }


  private getGeoConversionStatus(conversionId: string): Observable<GeoConversionStatus> {
    return this.httpClient.get<GeoConversionStatus>('/api/geo-convert/status/' + conversionId);
  }

  private transformError(err: any): Observable<never> {
    if (err?.error?.err_name) {
      let errorName = err.error.err_name;

      if (Object.values(ErrorType).some((type: string) => type === errorName)) {
        const msg = this.translate.instant('geoConvert.error.' + errorName);
        err = {
          isGeoConvertError: true,
          type: errorName as ErrorType,
          msg
        } as GeoConvertError;
      }
    }
    return throwError(err);
  }
}

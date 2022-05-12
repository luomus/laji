import { Injectable } from '@angular/core';
import { Observable, interval, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, concatMap, map, catchError, takeWhile } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

export const GEO_CONVERT_LIMIT = Number.MAX_VALUE;
export type GeoConversionStatus = 'pending'|'complete';

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
export enum ErrorType {
  tooComplex = 'too_complex',
  tooLarge = 'too_large'
}

export interface GeoConversionResponse {
  status: GeoConversionStatus;
  progressPercent: number;
  outputLink?: string;
}
export interface GeoConvertError {
  isGeoConvertError: true;
  type: ErrorType;
  msg: string;
}
interface GeoConversionStatusApiResponse {
  id: string;
  status: GeoConversionStatus;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  progress_percent: number;
}

export function isGeoConvertError(err: GeoConvertError|any): err is GeoConvertError {
  return err.isGeoConvertError;
}

@Injectable({providedIn: 'root'})
export class GeoConvertService {
  private pollInterval = 5000;

  constructor(
    private httpClient: HttpClient,
    private translate: TranslateService
  ) {}

  public geoConvertFile(
    fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs, personToken?: string
  ): Observable<GeoConversionResponse> {
    return this.startGeoConversion(fileId, format, geometry, crs, personToken).pipe(
      switchMap(conversionId => this.getResponse(conversionId)),
      catchError(err => this.transformError(err))
    );
  }

  public geoConvertData(
    data: FormData, fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs
  ): Observable<GeoConversionResponse> {
    return this.startGeoConversionFromData(data, fileId, format, geometry, crs).pipe(
      switchMap(conversionId => this.getResponse(conversionId)),
      catchError(err => this.transformError(err))
    );
  }

  private startGeoConversion(
    fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs, personToken?: string
  ): Observable<string> {
    const queryParams = {
      outputFormat: format,
      geometryType: geometry,
      crs
    };
    if (personToken) {
      queryParams['personToken'] = personToken;
    }
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

  private getResponse(conversionId: string): Observable<GeoConversionResponse> {
    return interval(this.pollInterval).pipe(
      concatMap(() => this.getGeoConversionStatus(conversionId)),
      takeWhile(result => result.status !== 'complete', true),
      map((result) => ({
        status: result.status,
        progressPercent: result.progress_percent,
        outputLink: result.status === 'complete' ? '/api/geo-convert/output/' + conversionId : null
      }))
    );
  }

  private getGeoConversionStatus(conversionId: string): Observable<GeoConversionStatusApiResponse> {
    return this.httpClient.get<GeoConversionStatusApiResponse>('/api/geo-convert/status/' + conversionId);
  }

  private transformError(err: any): Observable<never> {
    if (err?.error?.err_name) {
      const errorName = err.error.err_name;

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

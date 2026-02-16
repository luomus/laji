import { Injectable } from '@angular/core';
import { Observable, interval, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, concatMap, map, catchError, takeWhile } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

export type GeoConversionStatus = 'pending'|'complete';

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
    fileId: string, geometry: FileGeometry, crs: FileCrs, personToken?: string | null): Observable<GeoConversionResponse> {
    return this.startGeoConversion(fileId, geometry, crs, personToken).pipe(
      switchMap(conversionId => this.getResponse(conversionId, personToken)),
      catchError(err => this.transformError(err))
    );
  }

  public geoConvertData(
    data: FormData, fileId: string, geometry: FileGeometry, crs: FileCrs
  ): Observable<GeoConversionResponse> {
    return this.startGeoConversionFromData(data, fileId, geometry, crs).pipe(
      switchMap(conversionId => this.getResponse(conversionId)),
      catchError(err => this.transformError(err))
    );
  }

  private startGeoConversion(fileId: string, geometry: FileGeometry, crs: FileCrs, personToken?: string | null): Observable<string> {
    const queryParams: any = {
      geometryType: geometry,
      crs
    };
    if (personToken) {
      queryParams['personToken'] = personToken;
    }
    const params = new HttpParams({fromObject: queryParams});

    return this.httpClient.get<string>('/api/geo-convert/' + fileId, {params});
  }

  private startGeoConversionFromData(
    data: FormData, fileId: string, geometry: FileGeometry, crs: FileCrs
  ): Observable<string> {
    const queryParams = {
      geometryType: geometry,
      crs
    };
    const params = new HttpParams({fromObject: <any>queryParams});

    return this.httpClient.post<string>('/api/geo-convert/' + fileId, data, {params});
  }

  private getResponse(conversionId: string, personToken?: string | null): Observable<GeoConversionResponse> {
    return interval(this.pollInterval).pipe(
      concatMap(() => this.getGeoConversionStatus(conversionId, personToken)),
      takeWhile(result => result.status !== 'complete', true),
      map((result) => {
        let outputLink: string | undefined;
        if (result.status === 'complete') {
          outputLink = `${environment.apiBase}/geo-convert/output/${conversionId}`;
          if (personToken) {
            outputLink += '?personToken=' + personToken;
          }
        }

        return {
          status: result.status,
          progressPercent: result.progress_percent,
          outputLink
        };
      })
    );
  }

  private getGeoConversionStatus(conversionId: string, personToken?: string | null): Observable<GeoConversionStatusApiResponse> {
    const queryParams: any = { timestamp: Date.now() };
    if (personToken) {
      queryParams['personToken'] = personToken;
    }
    const params = new HttpParams({fromObject: queryParams});
    return this.httpClient.get<GeoConversionStatusApiResponse>('/api/geo-convert/status/' + conversionId, {params});
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

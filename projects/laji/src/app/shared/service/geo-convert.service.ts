import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, mergeMap, first, map } from 'rxjs/operators';
import { UserService } from './user.service';

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
export class GeoConvertService {
  private pollInterval = 5000;

  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  public getGISDownloadLink(fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs): Observable<string> {
    return this.startGeoConversion(fileId, format, geometry, crs).pipe(
      switchMap(conversionId => this.getOutputLink(conversionId))
    );
  }

  public getGISDownloadLinkFromData(
    data: FormData, fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs
  ): Observable<string> {
    return this.startGeoConversionFromData(data, fileId, format, geometry, crs).pipe(
      switchMap(conversionId => this.getOutputLink(conversionId))
    );
  }

  private startGeoConversion(fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs): Observable<string> {
    const queryParams = {
      'personToken': this.userService.getToken(),
      'outputFormat': format,
      'geometryType': geometry,
      'crs': crs
    };
    const params = new HttpParams({fromObject: <any>queryParams});

    return this.httpClient.get<string>('/api/geo-convert/' + fileId, {params: params});
  }

  private startGeoConversionFromData(
    data: FormData, fileId: string, format: FileFormat, geometry: FileGeometry, crs: FileCrs
  ): Observable<string> {
    const queryParams = {
      outputFormat: format,
      geometryType: geometry,
      crs: crs
    };
    const params = new HttpParams({fromObject: <any>queryParams});

    return this.httpClient.post<string>('/api/geo-convert/' + fileId, data, {params: params});
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
}

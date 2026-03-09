import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cacheReturnObservable } from 'projects/bird-atlas/src/app/core/atlas-api.service';
import { Observable } from 'rxjs';

@Injectable()
export class ModelViewerService {
  constructor(private http: HttpClient) {}

  @cacheReturnObservable(1000000)
  getBlob(src: string): Observable<any> {
    return this.http.get(src, { responseType: 'blob' });
  }
}

import { Injectable } from '@angular/core';
import { FileService } from './file.service';
import * as JSZip from 'jszip';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ZipService<T> {

  static ERROR_LOADING = 'loading failed';
  static ERROR_INVALID_CONTENT = 'loading failed';

  constructor(
    private fileService: FileService
  ) { }

  load(event: Event): Observable<T> {
    const target = <HTMLInputElement> event.target;
    return from(JSZip.loadAsync(target.files[0]).then(content => content.files['data.json'].async('text'))).pipe(
      catchError(() => throwError(ZipService.ERROR_LOADING)),
      map(jsonString => JSON.parse(jsonString as string) as T),
      catchError(() => throwError(ZipService.ERROR_INVALID_CONTENT)),
    );
  }

  save(filename: string, data: T): Observable<boolean> {
    const zip = new JSZip();
    zip.file('data.json', JSON.stringify(data));
    return from(zip.generateAsync({type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 }})).pipe(
      switchMap(blob => this.fileService.save(filename, blob as Blob))
    );
  }

}

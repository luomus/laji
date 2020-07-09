import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(private httpClient: HttpClient) { }

  download(url, filename) {
    return this.httpClient.get(url, {
      responseType: 'blob'
    }).pipe(
      tap(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(private httpClient: HttpClient) { }

  downloadTextFile(url, filename) {
    return this.httpClient.get(url, {
      responseType: 'text'
    }).pipe(
      tap(text => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(new Blob([text], {type : 'text/plain'}));
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    );
  }
}

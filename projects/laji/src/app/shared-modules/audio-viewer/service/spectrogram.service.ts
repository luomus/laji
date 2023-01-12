import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { ISpectrogramConfig } from '../models';
import { getSpectrogramImageData } from './spectrogram';

@Injectable()
export class SpectrogramService {
  private colormaps = {};
  private colormaps$ = {};

  constructor(
    private httpClient: HttpClient
  ) {}

  public getSpectrogramImageData(buffer: AudioBuffer, config?: ISpectrogramConfig): Observable<ImageData> {
    return this.getColormap().pipe(
      map(colormap => getSpectrogramImageData(buffer, colormap, config))
    );
  }

  private getColormap(colormap: 'inferno' | 'viridis' = 'viridis'): Observable<any> {
    if (this.colormaps[colormap]) {
      return of(this.colormaps[colormap]);
    }

    if (!this.colormaps$[colormap]) {
      this.colormaps$[colormap] = this.httpClient.get('/static/audio/' + colormap + '-colormap.json')
        .pipe(
          tap(result => {
            this.colormaps[colormap] = result;
          }),
          share()
        );
    }

    return this.colormaps$[colormap];
  }
}

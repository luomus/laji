import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { ISpectrogramConfig } from '../models';
import { getSpectrogramImageData } from './spectrogram';

type ColormapType = 'inferno' | 'viridis';

@Injectable()
export class SpectrogramService {
  private colormaps: { [key in ColormapType]?: number[][] } = {};
  private colormaps$: { [key in ColormapType]?: Observable<number[][]> } = {};

  constructor(
    private httpClient: HttpClient
  ) {}

  public getSpectrogramImageData(buffer: AudioBuffer, config?: ISpectrogramConfig): Observable<ImageData> {
    return this.getColormap().pipe(
      map(colormap => getSpectrogramImageData(buffer, colormap, config))
    );
  }

  private getColormap(colormap: ColormapType = 'viridis'): Observable<number[][]> {
    if (this.colormaps[colormap]) {
      return of(this.colormaps[colormap] as number[][]);
    }

    if (!this.colormaps$[colormap]) {
      this.colormaps$[colormap] = this.httpClient.get<number[][]>('/static/audio/' + colormap + '-colormap.json')
        .pipe(
          tap(result => {
            this.colormaps[colormap] = result;
          }),
          share()
        );
    }

    return this.colormaps$[colormap] as Observable<number[][]>;
  }
}

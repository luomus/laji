import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {share, switchMap, tap} from 'rxjs/operators';

@Injectable()
export class AudioService {
  private colormaps = {};
  private colormaps$ = {};

  constructor(protected httpClient: HttpClient) {
  }

  public getAudioBuffer(url: string, context: AudioContext): Observable<AudioBuffer> {
    return this.httpClient.get(url, { responseType: 'arraybuffer'})
      .pipe(
        switchMap((response: ArrayBuffer) => {
          return context.decodeAudioData(response);
        })
      );
  }

  public extractSegment(buffer: AudioBuffer, context: AudioContext, startTime: number, endTime: number): AudioBuffer {
    const startIdx = Math.floor(startTime * buffer.sampleRate);
    const endIdx = Math.ceil(endTime * buffer.sampleRate);

    const emptySegment = context.createBuffer(
      buffer.numberOfChannels,
      endIdx - startIdx,
      buffer.sampleRate
    );
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const chanData = buffer.getChannelData(i);
      const segmentChanData = emptySegment.getChannelData(i);
      for (let j = startIdx; j < endIdx; j++) {
        segmentChanData[j - startIdx] = chanData[j];
      }
    }

    return emptySegment;
  }

  public getColormap(colormap: 'viridis' = 'viridis'): Observable<any> {
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

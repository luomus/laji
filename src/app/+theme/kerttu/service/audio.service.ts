import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { SpectrogramService } from './spectrogram.service';

@Injectable()
export class AudioService {
  private buffer$ = {};
  private buffer: { [url: string]: { buffer: AudioBuffer, time: number } } = {};

  private colormaps = {};
  private colormaps$ = {};

  constructor(
    protected httpClient: HttpClient,
    private spectrogramService: SpectrogramService
  ) { }

  public getAudioBuffer(url: string, context: AudioContext): Observable<AudioBuffer> {
    if (this.buffer[url]) {
      this.buffer[url]['time'] = Date.now();
      return of(this.buffer[url]['buffer']);
    }

    if (!this.buffer$[url]) {
      this.buffer$[url] = this.httpClient.get(url, {responseType: 'arraybuffer'})
        .pipe(
          switchMap((response: ArrayBuffer) => {
            if (context.decodeAudioData.length === 2) { // for Safari
              return new Observable(observer => {
                  context.decodeAudioData(response, (buffer) =>  {
                    observer.next(buffer);
                  });
                }
              );
            } else {
              return context.decodeAudioData(response);
            }
          }),
          tap((buffer: AudioBuffer) => {
            this.buffer[url] = {
              'buffer': buffer,
              'time': Date.now()
            };
            this.removeOldBuffersFromCache();
          }),
          share()
        );
    }

    return this.buffer$[url];
  }

  public extractSegment(buffer: AudioBuffer, context: AudioContext, startTime: number, endTime: number, actualDuration: number): AudioBuffer {
    const emptySamplesAtStart = buffer.length - actualDuration * buffer.sampleRate;

    const startIdx = Math.max(Math.floor(startTime * buffer.sampleRate) + emptySamplesAtStart, emptySamplesAtStart);
    const endIdx = Math.min(Math.ceil(endTime * buffer.sampleRate) + emptySamplesAtStart, buffer.length - 1);

    const emptySegment = context.createBuffer(
      buffer.numberOfChannels,
      endIdx - startIdx + 1,
      buffer.sampleRate
    );
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const chanData = buffer.getChannelData(i);
      const segmentChanData = emptySegment.getChannelData(i);

      for (let j = startIdx; j <= endIdx; j++) {
        segmentChanData[j - startIdx] = chanData[j];
      }
    }

    return emptySegment;
  }

  public getSpectrogramImageData(buffer: AudioBuffer, nperseg: number, noverlap: number)
    : Observable<{ imageData: ImageData, maxFreq: number, maxTime: number }> {
    return this.getColormap().pipe(map(colormap => {
      const {spectrogram, width, heigth, maxFreq, maxTime} = this.spectrogramService.computeSpectrogram(buffer, nperseg, noverlap);
      const imageData = this.spectrogramToImageData(spectrogram, width, heigth, colormap);
      return {imageData, maxFreq, maxTime};
    }));
  }

  private spectrogramToImageData(spect: Float32Array, width: number, height: number, colormap: any): ImageData {
    const {minValue, maxValue} = this.findMinAndMaxValue(spect);
    const data = new Uint8ClampedArray(spect.length * 4);

    let offset = 0;
    for (let i = 0; i < spect.length; i++) {
      let value = spect[i];
      value = this.convertRange(value, [minValue, maxValue], [0, colormap.length - 1]);

      const color = colormap[Math.round(value)];

      data[offset++] = color[0] * 256;
      data[offset++] = color[1] * 256;
      data[offset++] = color[2] * 256;
      data[offset++] = 256;
    }

    return new ImageData(data, width, height);
  }

  private findMinAndMaxValue(data: Float32Array): {minValue: number, maxValue: number} {
    let minValue, maxValue;
    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (minValue == null || value < minValue) {
        minValue = value;
      }
      if (maxValue == null || value > maxValue) {
        maxValue = value;
      }
    }

    return {minValue, maxValue};
  }

  private convertRange(inputY: number, yRange: number[], xRange: number[]): number {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    const percent = (inputY - yMin) / (yMax - yMin);
    const outputX = percent * (xMax - xMin) + xMin;

    return outputX;
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

  private removeOldBuffersFromCache() {
    const keys = Object.keys(this.buffer);
    while (keys.length > 2) {
      const times = keys.map(key => this.buffer[key].time);
      const removed = times.indexOf(Math.min(...times));
      keys.splice(removed, 1);

      const newBuffer = {};
      for (const key of keys) {
        newBuffer[key] = this.buffer[key];
      }
      this.buffer = newBuffer;
    }
  }
}

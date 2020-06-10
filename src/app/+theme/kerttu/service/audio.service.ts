import { HttpClient } from '@angular/common/http';
import {Inject, Injectable, NgZone} from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { SpectrogramService } from './spectrogram.service';
import {WINDOW} from '@ng-toolkit/universal';

@Injectable()
export class AudioService {
  audioContext: AudioContext;

  private buffer$: { [url: string]: Observable<AudioBuffer> } = {};
  private buffer: { [url: string]: { buffer: AudioBuffer, time: number } } = {};

  private colormaps = {};
  private colormaps$ = {};

  constructor(
    @Inject(WINDOW) private window: Window,
    protected httpClient: HttpClient,
    private spectrogramService: SpectrogramService,
    private ngZone: NgZone
  ) {
    try {
      this.audioContext = new (this.window['AudioContext'] || this.window['webkitAudioContext'])();
    } catch (e) {
    }
  }

  public getAudioBuffer(url: string): Observable<AudioBuffer> {
    if (this.buffer[url]) {
      this.buffer[url]['time'] = Date.now();
      return of(this.buffer[url]['buffer']);
    }

    if (!this.buffer$[url]) {
      this.buffer$[url] = this.httpClient.get(url, {responseType: 'arraybuffer'})
        .pipe(
          switchMap((response: ArrayBuffer) => {
            if (this.audioContext.decodeAudioData.length === 2) { // for Safari
              return new Observable(observer => {
                  this.audioContext.decodeAudioData(response, (buffer) =>  {
                    this.ngZone.run(() => {
                      observer.next(buffer);
                      observer.complete();
                    });
                  });
                }
              );
            } else {
              return this.audioContext.decodeAudioData(response);
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

  public extractSegment(buffer: AudioBuffer, startTime: number, endTime: number, actualDuration: number): AudioBuffer {
    const emptySamplesAtStart = buffer.length - actualDuration * buffer.sampleRate;

    const startIdx = Math.max(Math.floor(startTime * buffer.sampleRate) + emptySamplesAtStart, emptySamplesAtStart);
    const endIdx = Math.min(Math.ceil(endTime * buffer.sampleRate) + emptySamplesAtStart, buffer.length - 1);

    const emptySegment = this.audioContext.createBuffer(
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

  public createSource(buffer: AudioBuffer, frequencyRange?: number[]) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    if (frequencyRange) {
      const highpassFilter = this.createFilter('highpass', frequencyRange[0]);
      const lowpassFilter = this.createFilter('lowpass', frequencyRange[1]);
      source.connect(highpassFilter);
      highpassFilter.connect(lowpassFilter);
      lowpassFilter.connect(this.audioContext.destination);
    } else {
      source.connect(this.audioContext.destination);
    }

    return source;
  }

  public getTime() {
    return this.audioContext.currentTime;
  }

  public getPlayedTime(startTime: number, playbackRate: number) {
    return (this.audioContext.currentTime - startTime) * playbackRate;
  }

  private createFilter(type: 'highpass'|'lowpass', frequency: number) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    return filter;
  }

  public getSpectrogramImageData(buffer: AudioBuffer, sampleRate: number, nperseg: number, noverlap: number)
    : Observable<{ imageData: ImageData, maxFreq: number, maxTime: number }> {
    return this.getColormap().pipe(map(colormap => {
      const {spectrogram, width, heigth, maxFreq, maxTime} = this.spectrogramService.computeSpectrogram(buffer, sampleRate, nperseg, noverlap);
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
      delete this.buffer$[removed];
    }

    const newBuffer = {};
    for (const key of keys) {
      newBuffer[key] = this.buffer[key];
    }
    this.buffer = newBuffer;
  }
}

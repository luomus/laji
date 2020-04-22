import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, share, switchMap, tap} from 'rxjs/operators';
import {FFT} from './FFT';

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

  public drawSpectrogramToCanvas(buffer: AudioBuffer, nperseg: number, noverlap: number, canvas: HTMLCanvasElement)
    : Observable<{ canvas: HTMLCanvasElement, maxFreq: number, maxTime: number }> {
    return this.getColormap().pipe(map(colormap => {
      const {spectrogram, maxFreq, maxTime} = this.computeSpectrogram(buffer, nperseg, noverlap);
      this.drawSpectrogram(spectrogram, maxFreq, maxTime, colormap, canvas);
      return {canvas, maxFreq, maxTime};
    }));
  }

  private drawSpectrogram(spectrogram: Uint8Array[], maxFreq: number, maxTime: number, colormap: any, canvas: HTMLCanvasElement) {
    const width = spectrogram.length;
    const height = spectrogram[0].length;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < spectrogram.length; i++) {
      for (let j = 0; j < spectrogram[i].length; j++) {
        const color = colormap[spectrogram[i][j]];
        ctx.fillStyle =
          'rgba(' +
          color[0] * 256 +
          ', ' +
          color[1] * 256 +
          ', ' +
          color[2] * 256 +
          ',' +
          color[3] +
          ')';
        ctx.fillRect(i, spectrogram[i].length - 1 - j, 1, 1);
      }
    }
  }

  private computeSpectrogram(buffer: AudioBuffer, nperseg: number, noverlap: number): {spectrogram: Uint8Array[], maxFreq: number, maxTime: number} {
    const fft = new FFT(nperseg, buffer.sampleRate, 'hann');
    const chanData = buffer.getChannelData(0);

    const spectrogram = [];
    let offset = 0;

    while (offset + nperseg < chanData.length) {
      const segment = chanData.slice(
        offset,
        offset + nperseg
      );
      const spectrum = fft.calculateSpectrum(segment);
      const spectrogramColumn = new Uint8Array(nperseg / 2);
      for (let j = 0; j < nperseg / 2; j++) {
        spectrogramColumn[j] = Math.max(-255, Math.log10(spectrum[j]) * 45);
      }
      spectrogram.push(spectrogramColumn);
      offset += nperseg - noverlap;
    }

    const maxFreq = Math.floor(buffer.sampleRate / 2);
    const maxTime = buffer.duration;

    return {spectrogram, maxFreq, maxTime};
  }

  private getColormap(colormap: 'viridis' = 'viridis'): Observable<any> {
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

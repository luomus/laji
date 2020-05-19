import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import {map, share, switchMap, tap} from 'rxjs/operators';
import {FFT} from './FFT';

@Injectable()
export class AudioService {
  private buffer$ = {};

  private colormaps = {};
  private colormaps$ = {};

  constructor(protected httpClient: HttpClient) {
  }

  public getAudioBuffer(url: string, context: AudioContext): Observable<AudioBuffer> {
    if (!this.buffer$[url]) {
      this.buffer$[url] = this.httpClient.get(url, { responseType: 'arraybuffer'})
        .pipe(
          switchMap((response: ArrayBuffer) => {
            return context.decodeAudioData(response);
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

  public drawSpectrogramToCanvas(buffer: AudioBuffer, nperseg: number, noverlap: number, canvas: HTMLCanvasElement)
    : Observable<{ canvas: HTMLCanvasElement, maxFreq: number, maxTime: number }> {
    return this.getColormap().pipe(map(colormap => {
      const {spectrogram, maxFreq, maxTime} = this.computeSpectrogram(buffer, nperseg, noverlap);
      const imageData = this.spectrogramToImageData(spectrogram, colormap);
      this.drawImage(imageData, canvas);
      return {canvas, maxFreq, maxTime};
    }));
  }

  private drawImage(data: ImageData, canvas: HTMLCanvasElement) {
    canvas.width = data.width;
    canvas.height = data.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, data.width, data.height);
    ctx.putImageData(data, 0, 0);
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
    const maxTime = (spectrogram.length - 1) * ((nperseg - noverlap) / buffer.sampleRate) + nperseg / buffer.sampleRate;

    return {spectrogram, maxFreq, maxTime};
  }

  private spectrogramToImageData(spect: Uint8Array[], colormap: any): ImageData {
    const data = new Uint8ClampedArray(spect.length * spect[0].length * 4);

    for (let i = 0; i < spect.length; i++) {
      for (let j = 0; j < spect[0].length; j++) {
        const color = colormap[spect[i][spect[0].length - 1 - j]];
        data[4 * j * spect.length + 4 * i] = color[0] * 256;
        data[4 * j * spect.length + 4 * i + 1] = color[1] * 256;
        data[4 * j * spect.length + 4 * i + 2] = color[2] * 256;
        data[4 * j * spect.length + 4 * i + 3] = color[3] * 256;
      }
    }

    return new ImageData(data, spect.length, spect[0].length);
  }

  private getColormap(colormap: 'inferno'|'viridis' = 'inferno'): Observable<any> {
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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { FFT } from './assets/FFT';
import { gaussBlur_4 } from './assets/gaussian-blur';
import { ISpectrogramConfig } from '../models';

@Injectable()
export class SpectrogramService {
  private defaultConfig: ISpectrogramConfig = {
    sampleRate: 22050,
    nperseg: 256,
    noverlap: 256 - 160,
    nbrOfRowsRemovedFromStart: 2,
    maxNbrOfColsForNoiseEstimation: 6000,
    noiseReductionParam: 2,
    logRange: 3
  };

  private colormaps = {};
  private colormaps$ = {};

  constructor(
    private httpClient: HttpClient
  ) {}

  public getSpectrogramImageData(buffer: AudioBuffer, config?: ISpectrogramConfig): Observable<ImageData> {
    config = config ? {...this.defaultConfig, ...config} : this.defaultConfig;

    return this.getColormap().pipe(
      switchMap(colormap => this.computeSpectrogram(buffer, config).pipe(
        map(({spectrogram, width, heigth}) => this.spectrogramToImageData(spectrogram, width, heigth, colormap))
      ))
    );
  }

  private spectrogramToImageData(spect: Float32Array, width: number, height: number, colormap: any): ImageData {
    const {minValue, maxValue} = this.findMinAndMaxValue(spect);
    const data = new Uint8ClampedArray(spect.length * 4);

    let offset = 0;
    for (let value of spect) {
      value = this.convertRange(value, [minValue, maxValue], [0, colormap.length - 1]);

      const color = colormap[Math.round(value)];

      data[offset++] = color[0] * 256;
      data[offset++] = color[1] * 256;
      data[offset++] = color[2] * 256;
      data[offset++] = 256;
    }

    return new ImageData(data, width, height);
  }

  private computeSpectrogram(buffer: AudioBuffer, config: ISpectrogramConfig): Observable<{
    spectrogram: Float32Array; width: number; heigth: number;
  }> {
    return this.getData(buffer, config).pipe(map(({data, sumByColumn}) => {
      const meanNoise = this.getMeanNoiseColumn(data, sumByColumn, config);
      const maxValue = this.filterNoiseAndFindMaxValue(data, meanNoise, config);

      this.scaleSpectrogram(data, maxValue, config);

      const width = data.length;
      const heigth = data[0].length;
      const flattenedData = this.flattenData(data);

      const blurredData = new Float32Array(flattenedData.length);
      gaussBlur_4(flattenedData, blurredData, width, heigth, 1);

      return {spectrogram: blurredData, width, heigth};
    }));
  }

  private getData(buffer: AudioBuffer, config: ISpectrogramConfig): Observable<{data: Float32Array[]; sumByColumn: number[]}> {
    const {sampleRate, nperseg, noverlap} = config;

    return this.resampleBuffer(buffer, sampleRate).pipe(map((resampled) => {
      const chanData = resampled.getChannelData(0);

      const fft = new FFT(nperseg, sampleRate, 'hann');

      const data = [];
      const sumByColumn = [];

      const maxRow =  Math.floor(buffer.sampleRate / 2) * nperseg / sampleRate;

      let offset = 0;
      while (offset + nperseg < chanData.length) {
        const segment = chanData.slice(
          offset,
          offset + nperseg
        );
        const spectrum = fft.calculateSpectrum(segment);
        const columnData = new Float32Array(nperseg / 2);
        let columnSum = 0;

        for (let j = 0; j < nperseg / 2; j++) {
          if (j <= maxRow) {
            columnData[j] = Math.pow(Math.abs(spectrum[j]), 2);
          } else {
            columnData[j] = 0;
          }

          columnSum += columnData[j];
        }

        data.push(columnData);
        sumByColumn.push(columnSum);
        offset += nperseg - noverlap;
      }

      return {data, sumByColumn};
    }));
  }

  private getMeanNoiseColumn(data: Float32Array[], sumByColumn: number[], config: ISpectrogramConfig): Float32Array {
    const nbrOfColumns = Math.min(sumByColumn.length, config.maxNbrOfColsForNoiseEstimation);
    const indexArray = [...Array(nbrOfColumns).keys()];
    indexArray.sort((a, b) => sumByColumn[a] < sumByColumn[b] ? -1 : sumByColumn[a] > sumByColumn[b] ? 1 : 0);

    /* estimate noise level from 10% of columns with lowest energy */
    const n = Math.round(nbrOfColumns / 10);
    const meanByRow = new Float32Array(data[0].length);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < data[0].length; j++) {
        meanByRow[j] += data[indexArray[i]][j];
      }
    }
    for (let i = 0; i < meanByRow.length; i++) {
      meanByRow[i] = meanByRow[i] / n;
    }
    return meanByRow;
  }

  private filterNoiseAndFindMaxValue(data: Float32Array[], meanNoise: Float32Array, config: ISpectrogramConfig): number {
    let maxValue = 0;

    for (const item of data) {
      for (let j = 0; j < data[0].length; j++) {
        item[j] = item[j] - config.noiseReductionParam * meanNoise[j];
        if (item[j] < 0) {
          item[j] = 0;
        }
        // first rows are usually very noisy
        if (j < config.nbrOfRowsRemovedFromStart) {
          item[j] = 0;
        }

        if (item[j] > maxValue) {
          maxValue = item[j];
        }
      }
    }
    return maxValue;
  }

  private scaleSpectrogram(data: Float32Array[], maxValue: number, config: ISpectrogramConfig) {
    const logRange = config.logRange;

    for (const item of data) {
      for (let j = 0; j < data[0].length; j++) {
        item[j] = (Math.log10(item[j] / maxValue + Math.pow(10, -2 * logRange)) + 2 * logRange) / (2 * logRange);
      }
    }
  }

  private flattenData(data: Float32Array[]): Float32Array {
    const result = new Float32Array(data.length * data[0].length);

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        result[j * data.length + i] = data[i][data[0].length - 1 - j];
      }
    }

    return result;
  }

  private findMinAndMaxValue(data: Float32Array): {minValue: number; maxValue: number} {
    let minValue: number, maxValue: number;
    for (const value of data) {
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

    return percent * (xMax - xMin) + xMin;
  }

  private resampleBuffer(buffer: AudioBuffer, sampleRate: number): Observable<AudioBuffer> {
    if (buffer.sampleRate === sampleRate) {
      return of(buffer);
    }

    const offlineCtx = new OfflineAudioContext(buffer.numberOfChannels, buffer.duration * sampleRate, sampleRate);
    const offlineSource = offlineCtx.createBufferSource();
    offlineSource.buffer = buffer;
    offlineSource.connect(offlineCtx.destination);
    offlineSource.start();
    return from(offlineCtx.startRendering());
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

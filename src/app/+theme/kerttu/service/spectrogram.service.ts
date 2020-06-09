import { Injectable } from '@angular/core';
import { FFT } from './assets/FFT';
import { gaussBlur_4 } from './assets/gaussian-blur';
import { Resampler } from './assets/resample';

@Injectable()
export class SpectrogramService {
  private maxNbrOfColsForNoiseEstimation = 6000;
  private noiseReductionParam = 2;
  private nbrOfRowsRemovedFromStart = 2;
  private logRange = 3;

  constructor() {}

  public computeSpectrogram(buffer: AudioBuffer, sampleRate: number, nperseg: number, noverlap: number): {
    spectrogram: Float32Array, width: number, heigth: number, maxFreq: number, maxTime: number
  } {
    const {data, sumByColumn} = this.getData(buffer, sampleRate, nperseg, noverlap);

    const meanNoise = this.getMeanNoiseColumn(data, sumByColumn);
    const maxValue = this.filterNoiseAndFindMaxValue(data, meanNoise);

    this.scaleSpectrogram(data, maxValue);

    const width = data.length;
    const heigth = data[0].length;
    const flattenedData = this.flattenData(data);

    const blurredData = new Float32Array(flattenedData.length);
    gaussBlur_4(flattenedData, blurredData, width, heigth, 1);

    const maxFreq = Math.floor(sampleRate / 2);
    const maxTime = (data.length - 1) * ((nperseg - noverlap) / sampleRate) + nperseg / sampleRate;

    return {spectrogram: blurredData, width, heigth, maxFreq, maxTime};
  }

  private getData(buffer: AudioBuffer, sampleRate: number, nperseg: number, noverlap: number): {data: Float32Array[], sumByColumn: number[]} {
    let chanData = buffer.getChannelData(0);
    const resampler = new Resampler(buffer.sampleRate, sampleRate, 1, chanData);
    resampler.resampler(chanData.length);
    chanData = resampler.outputBuffer;

    const fft = new FFT(nperseg, sampleRate, 'hann');

    const data = [];
    const sumByColumn = [];

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
        columnData[j] = Math.pow(Math.abs(spectrum[j]), 2);
        columnSum += columnData[j];
      }

      data.push(columnData);
      sumByColumn.push(columnSum);
      offset += nperseg - noverlap;
    }

    return {data: data, sumByColumn: sumByColumn};
  }

  private getMeanNoiseColumn(data: Float32Array[], sumByColumn: number[]): Float32Array {
    const nbrOfColumns = Math.min(sumByColumn.length, this.maxNbrOfColsForNoiseEstimation);
    const indexArray = [...Array(nbrOfColumns).keys()];
    indexArray.sort((a, b) => {
      return sumByColumn[a] < sumByColumn[b] ? -1 : sumByColumn[a] > sumByColumn[b] ? 1 : 0;
    });

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

  private filterNoiseAndFindMaxValue(data: Float32Array[], meanNoise: Float32Array): number {
    let maxValue = 0;

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        data[i][j] = data[i][j] - this.noiseReductionParam * meanNoise[j];
        if (data[i][j] < 0) {
          data[i][j] = 0;
        }
        // first two rows are usually very noisy
        if (j < this.nbrOfRowsRemovedFromStart) {
          data[i][j] = 0;
        }

        if (data[i][j] > maxValue) {
          maxValue = data[i][j];
        }
      }
    }
    return maxValue;
  }

  private scaleSpectrogram(data: Float32Array[], maxValue: number) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        data[i][j] = (Math.log10(data[i][j] / maxValue + Math.pow(10, -2 * this.logRange)) + 2 * this.logRange) / (2 * this.logRange);
      }
    }
  }

  private flattenData(data: Float32Array[]): Float32Array {
    const result = new Float32Array(data.length * data[0].length);

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        const value = data[i][data[0].length - 1 - j];
        result[j * data.length + i] = value;
      }
    }

    return result;
  }
}

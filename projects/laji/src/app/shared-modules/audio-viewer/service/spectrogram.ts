import { FFT } from './assets/FFT';
import { gaussBlur_4 } from './assets/gaussian-blur';
import { ISpectrogramConfig } from '../models';
import { AudioViewerUtils } from './audio-viewer-utils';
import { defaultSpectrogramConfig } from '../variables';

const defaultConfig: ISpectrogramConfig = defaultSpectrogramConfig;

export function getSpectrogramImageData(buffer: AudioBuffer, colormap: any, config?: ISpectrogramConfig): ImageData {
  config = config ? {...defaultConfig, ...config} : defaultConfig;

  const {spectrogram, width, height} = computeSpectrogram(buffer, config);
  return spectrogramToImageData(spectrogram, width, height, colormap);
}

function spectrogramToImageData(spect: Float32Array, width: number, height: number, colormap: any): ImageData {
  const {minValue, maxValue} = findMinAndMaxValue(spect);
  const data = new Uint8ClampedArray(spect.length * 4);

  let offset = 0;
  for (let value of spect) {
    value = convertRange(value, [minValue, maxValue], [0, colormap.length - 1]);
    const color = colormap[Math.round(value)];

    data[offset++] = color[0] * 256;
    data[offset++] = color[1] * 256;
    data[offset++] = color[2] * 256;
    data[offset++] = 256;
  }

  return new ImageData(data, width, height);
}

function computeSpectrogram(buffer: AudioBuffer, config: ISpectrogramConfig): {
  spectrogram: Float32Array; width: number; height: number;
} {
  const {data, sumByColumn} = getData(buffer, config);
  const meanNoise = getMeanNoiseColumn(data, sumByColumn, config);
  const maxValue = filterNoiseAndFindMaxValue(data, meanNoise, config);

  scaleSpectrogram(data, maxValue, config);

  const width = data.length;
  const height = data[0].length;

  const flattenedData = flattenData(data);
  const blurredData = new Float32Array(flattenedData.length);
  gaussBlur_4(flattenedData, blurredData, width, height, 1);

  return {spectrogram: blurredData, width, height};
}

function getData(buffer: AudioBuffer, config: ISpectrogramConfig): {data: Float32Array[]; sumByColumn: number[]} {
  const {nperseg, noverlap} = getSegmentSizeAndOverlap(config, buffer.sampleRate);

  const chanData = buffer.getChannelData(0);

  const fft = new FFT(nperseg, buffer.sampleRate, 'hann');

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

  return {data, sumByColumn};
}

function getMeanNoiseColumn(data: Float32Array[], sumByColumn: number[], config: ISpectrogramConfig): Float32Array {
  const nbrOfColumns = Math.min(sumByColumn.length, config.maxNbrOfColsForNoiseEstimation);
  const indexArray = [...Array(nbrOfColumns).keys()];
  indexArray.sort((a, b) => sumByColumn[a] < sumByColumn[b] ? -1 : sumByColumn[a] > sumByColumn[b] ? 1 : 0);

  /* estimate noise level from 10% of columns with the lowest energy */
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

function filterNoiseAndFindMaxValue(data: Float32Array[], meanNoise: Float32Array, config: ISpectrogramConfig): number {
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

function scaleSpectrogram(data: Float32Array[], maxValue: number, config: ISpectrogramConfig) {
  const logRange = config.logRange;

  for (const item of data) {
    for (let j = 0; j < data[0].length; j++) {
      item[j] = (Math.log10(item[j] / (maxValue || 1) + Math.pow(10, -2 * logRange)) + 2 * logRange) / (2 * logRange);
    }
  }
}

function flattenData(data: Float32Array[]): Float32Array {
  const result = new Float32Array(data.length * data[0].length);

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      result[j * data.length + i] = data[i][data[0].length - 1 - j];
    }
  }

  return result;
}

function findMinAndMaxValue(data: Float32Array): {minValue: number; maxValue: number} {
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

function convertRange(input: number, inputRange: number[], outputRange: number[]): number {
  const [inputRangeMin, inputRangeMax] = inputRange;
  const [outputRangeMin, outputRangeMax] = outputRange;
  const percent = (input - inputRangeMin) / ((inputRangeMax - inputRangeMin) || 1);

  return percent * (outputRangeMax - outputRangeMin) + outputRangeMin;
}

function getSegmentSizeAndOverlap(config: ISpectrogramConfig, sampleRate: number): {nperseg: number; noverlap: number} {
  const nperseg = AudioViewerUtils.getSpectrogramSegmentLength(config.targetWindowLengthInSeconds, sampleRate);
  const noverlap = Math.round(config.targetWindowOverlapPercentage * nperseg);
  return {nperseg, noverlap};
}



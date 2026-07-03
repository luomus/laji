import { FFT } from './assets/FFT';
import { gaussBlur_4 } from './assets/gaussian-blur';
import { SpectrogramConfig } from '../models';
import { defaultSpectrogramConfig } from '../variables';
import { getSpectrogramSegmentLength } from './audio-viewer-utils';

const MAX_CANVAS_WIDTH = 4096;

interface CompleteSpectrogramConfig extends SpectrogramConfig {
  nbrOfRowsRemovedFromStart: number;
  maxNbrOfColsForNoiseEstimation: number;
  noiseReductionParam: number;
  logRange: number;
  minFrequency: number;
  maxFrequency: number;
}

export function getSpectrogramImageData(buffer: AudioBuffer, colormap: number[][], config?: SpectrogramConfig): ImageData {
  const defaultConfig = {...defaultSpectrogramConfig, maxFrequency: buffer.sampleRate / 2};
  config = config ? {...defaultConfig, ...config} : defaultConfig;

  const {spectrogram, width, height} = computeSpectrogram(buffer, config as CompleteSpectrogramConfig);
  return spectrogramToImageData(spectrogram, width, height, colormap);
}

function spectrogramToImageData(spect: Float32Array, width: number, height: number, colormap: number[][]): ImageData {
  const {minValue, maxValue} = findMinAndMaxValue(spect);

  // downsample with nearest neighbour method if the width exceeds the max canvas width
  const targetWidth = Math.min(width, MAX_CANVAS_WIDTH);
  const needsDownsampling = targetWidth < width;

  const data = new Uint8ClampedArray(targetWidth * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = needsDownsampling ? Math.round((x / targetWidth) * (width - 1)) : x;
      let value = spect[y * width + srcX];

      value = convertRange(value, [minValue, maxValue], [0, colormap.length - 1]);

      const color = colormap[Math.round(value)];

      const offset = (y * targetWidth + x) * 4;
      data[offset] = color[0] * 256;
      data[offset + 1] = color[1] * 256;
      data[offset + 2] = color[2] * 256;
      data[offset + 3] = 256;
    }
  }

  return new ImageData(data, targetWidth, height);
}

function computeSpectrogram(buffer: AudioBuffer, config: CompleteSpectrogramConfig): {
  spectrogram: Float32Array; width: number; height: number;
} {
  const {data, sumByColumn} = getData(buffer, config);
  const meanNoise = getMeanNoiseColumn(data, sumByColumn, config);
  const maxValue = filterNoiseAndFindMaxValue(data, meanNoise, buffer.sampleRate, config);

  scaleSpectrogram(data, maxValue, config);

  const width = data.length;
  const height = data[0].length;

  const flattenedData = flattenData(data);
  const blurredData = new Float32Array(flattenedData.length);
  gaussBlur_4(flattenedData, blurredData, width, height, 1);

  return {spectrogram: blurredData, width, height};
}

function getData(buffer: AudioBuffer, config: SpectrogramConfig): {data: Float32Array[]; sumByColumn: number[]} {
  const {nperseg, noverlap} = getSegmentSizeAndOverlap(buffer, config);

  const chanData = buffer.getChannelData(0);
  // @ts-ignore
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

function getMeanNoiseColumn(data: Float32Array[], sumByColumn: number[], config: CompleteSpectrogramConfig): Float32Array {
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

function filterNoiseAndFindMaxValue(data: Float32Array[], meanNoise: Float32Array, sampleRate: number, config: CompleteSpectrogramConfig): number {
  let maxValue = 0;
  const columnLength = data[0].length;

  let minRow = Math.floor(config.minFrequency / ((sampleRate / 2) / columnLength));
  minRow = Math.max(minRow, config.nbrOfRowsRemovedFromStart);
  const maxRow = Math.ceil(config.maxFrequency / ((sampleRate / 2) / columnLength));

  for (const item of data) {
    for (let j = 0; j < columnLength; j++) {
      if (j < minRow || j > maxRow) {
        item[j] = 0;
      } else {
        item[j] = item[j] - config.noiseReductionParam * meanNoise[j];

        if (item[j] < 0) {
          item[j] = 0;
        }

        if (item[j] > maxValue) {
          maxValue = item[j];
        }
      }
    }
  }

  return maxValue;
}

function scaleSpectrogram(data: Float32Array[], maxValue: number, config: CompleteSpectrogramConfig) {
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
  let minValue: number|undefined, maxValue: number|undefined;
  for (const value of data) {
    if (minValue == null || value < minValue) {
      minValue = value;
    }
    if (maxValue == null || value > maxValue) {
      maxValue = value;
    }
  }

  return {minValue: minValue as number, maxValue: maxValue as number};
}

function convertRange(input: number, inputRange: number[], outputRange: number[]): number {
  const [inputRangeMin, inputRangeMax] = inputRange;
  const [outputRangeMin, outputRangeMax] = outputRange;
  const percent = (input - inputRangeMin) / ((inputRangeMax - inputRangeMin) || 1);

  return percent * (outputRangeMax - outputRangeMin) + outputRangeMin;
}

function getSegmentSizeAndOverlap(buffer: AudioBuffer, config: SpectrogramConfig): {nperseg: number; noverlap: number} {
  const nperseg = getSpectrogramSegmentLength(config.targetWindowLengthInSeconds, buffer.sampleRate);

  let targetWindowOverlapPercentage: number|undefined;
  if (config.targetWindowOverlapPercentage === 'auto') {
    targetWindowOverlapPercentage = convertRange(Math.min(Math.max(buffer.length, 100000), 1000000), [100000, 1000000], [0.95, 0.375]);
  } else {
    targetWindowOverlapPercentage = config.targetWindowOverlapPercentage;
  }

  let noverlap = Math.round(targetWindowOverlapPercentage * nperseg);

  // if the width is larger than the max canvas width, overlap can be reduced without it affecting quality
  const width = Math.floor(buffer.length / (nperseg - noverlap));
  if (width > MAX_CANVAS_WIDTH) {
    const maxStep = Math.ceil(buffer.length / MAX_CANVAS_WIDTH);
    noverlap = Math.max(nperseg - maxStep, 0);
  }

  return {nperseg, noverlap};
}

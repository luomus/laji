import { ISpectrogramConfig } from './models';

export const defaultSpectrogramConfig: ISpectrogramConfig = {
  sampleRate: 22050,
  tarwindowLengthInSeconds: 0.015,
  tarwindowOverlapPercentage: 0.375,
  nbrOfRowsRemovedFromStart: 0,
  maxNbrOfColsForNoiseEstimation: 6000,
  noiseReductionParam: 2,
  logRange: 3
};

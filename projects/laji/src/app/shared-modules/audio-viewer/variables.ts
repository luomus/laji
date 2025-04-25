import { SpectrogramConfig } from './models';

export const defaultSpectrogramConfig: SpectrogramConfig = {
  targetWindowLengthInSeconds: 0.015,
  targetWindowOverlapPercentage: 0.375,
  nbrOfRowsRemovedFromStart: 0,
  maxNbrOfColsForNoiseEstimation: 6000,
  noiseReductionParam: 2,
  logRange: 3,
  minFrequency: 0
};

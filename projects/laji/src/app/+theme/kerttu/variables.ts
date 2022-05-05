import { ISpectrogramConfig } from '../../shared-modules/audio-viewer/models';

export const spectrogramConfig: ISpectrogramConfig = {
  sampleRate: 22050,
  targetWindowLengthInSeconds: 0.015,
  targetWindowOverlapPercentage: 0.375,
  nbrOfRowsRemovedFromStart: 2,
  maxNbrOfColsForNoiseEstimation: 6000,
  noiseReductionParam: 2,
  logRange: 3
};

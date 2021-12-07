import { ISpectrogramConfig } from '../../shared-modules/audio-viewer/models';

export const spectrogramConfig: ISpectrogramConfig = {
  sampleRate: 22050,
  nperseg: 256,
  noverlap: 256 - 160,
  nbrOfRowsRemovedFromStart: 2,
  maxNbrOfColsForNoiseEstimation: 6000,
  noiseReductionParam: 2,
  logRange: 3
};

import { ISpectrogramConfig } from '../../shared-modules/audio-viewer/models';
import { defaultSpectrogramConfig } from '../../shared-modules/audio-viewer/variables';

export const spectrogramConfig: ISpectrogramConfig = {
  ...defaultSpectrogramConfig,
  nbrOfRowsRemovedFromStart: 2
};

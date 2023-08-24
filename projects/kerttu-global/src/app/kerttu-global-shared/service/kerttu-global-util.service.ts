import { TaxonTypeEnum } from '../models';
import { defaultAudioSampleRate, defaultBatAudioSampleRate, defaultInsectAudioSampleRate } from '../variables';

export class KerttuGlobalUtil {
  /**
   * Maps number to letter (1 -> a, 2 -> b, ...)
   */
  public static numberToLetter(num: number): string {
    let s = '', t;

    while (num > 0) {
      t = (num - 1) % 26;
      s = String.fromCharCode(97 + t) + s;
      // eslint-disable-next-line no-bitwise
      num = (num - t)/26 | 0;
    }
    return s;
  }

  public static getDefaultSampleRate(taxonType: TaxonTypeEnum = TaxonTypeEnum.bird) {
    return taxonType === TaxonTypeEnum.bird ? defaultAudioSampleRate :
      taxonType === TaxonTypeEnum.bat ? defaultBatAudioSampleRate :
        defaultInsectAudioSampleRate;
  }
}

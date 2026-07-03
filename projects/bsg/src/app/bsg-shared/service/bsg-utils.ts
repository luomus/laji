import { TaxonTypeEnum } from '../models';
import { defaultAudioSampleRate, defaultBatAudioSampleRate, defaultInsectAudioSampleRate } from '../variables';

export function getBoxLabel(speciesIdx: number, idx: number, groupIdx?: number): string {
  return (speciesIdx + 1) + numberToLetter(idx + 1) + (groupIdx != null ? '-' + (groupIdx + 1) : '');
}

/**
 * Maps number to letter (1 -> a, 2 -> b, ...)
 */
export function numberToLetter(num: number): string {
  let s = '', t;

  while (num > 0) {
    t = (num - 1) % 26;
    s = String.fromCharCode(97 + t) + s;
    // eslint-disable-next-line no-bitwise
    num = (num - t)/26 | 0;
  }
  return s;
}

export function getDefaultSampleRate(taxonType: TaxonTypeEnum = TaxonTypeEnum.bird) {
  return taxonType === TaxonTypeEnum.bat ? defaultBatAudioSampleRate :
    taxonType === TaxonTypeEnum.insect ? defaultInsectAudioSampleRate :
      defaultAudioSampleRate;
}

export function getDefaultSelectableTaxonTypes(taxonType: TaxonTypeEnum): TaxonTypeEnum[] {
  const birdGroup = [TaxonTypeEnum.bird, TaxonTypeEnum.mammal, TaxonTypeEnum.frog];
  return birdGroup.includes(taxonType) ? birdGroup : [taxonType];
}

export function queryParameterToIntList(value?: string): number[] {
  return (value || '').split(',').map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id));
}

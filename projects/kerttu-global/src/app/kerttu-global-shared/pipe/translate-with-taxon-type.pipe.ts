import { Pipe, PipeTransform } from '@angular/core';
import { TaxonTypeEnum } from '../models';
import { TranslateService } from '@ngx-translate/core';

const taxonTypeSuffix: Record<TaxonTypeEnum, string | undefined> = {
  [TaxonTypeEnum.bird]: 'bird',
  [TaxonTypeEnum.bat]: 'bat',
  [TaxonTypeEnum.insect]: 'insect',
  [TaxonTypeEnum.frog]: 'frog',
  [TaxonTypeEnum.mammal]: 'mammal',
  [TaxonTypeEnum.other]: undefined
};

export const getTranslateKeyWithTaxonType = (value: string, taxonType?: TaxonTypeEnum): string => {
  if (taxonType && taxonTypeSuffix[taxonType]) {
    return `${value}.${taxonTypeSuffix[taxonType]}`;
  }
  return value;
};

@Pipe({
    name: 'translateWithTaxonType',
    standalone: false
})
export class TranslateWithTaxonTypePipe implements PipeTransform {
  constructor(
    private translate: TranslateService
  ) {}

  transform(value: string, taxonType?: TaxonTypeEnum): string {
    const key = getTranslateKeyWithTaxonType(value, taxonType);
    return this.translate.instant(key);
  }
}

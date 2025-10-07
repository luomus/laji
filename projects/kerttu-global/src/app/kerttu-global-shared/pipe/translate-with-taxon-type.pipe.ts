import { Pipe, PipeTransform } from '@angular/core';
import { TaxonTypeEnum } from '../models';
import { TranslateService } from '@ngx-translate/core';

export const getTranslateKeyWithTaxonType = (value: string, taxonType?: TaxonTypeEnum): string => {
  let taxonString = 'Bird';
  if (taxonType === TaxonTypeEnum.bat) {
    taxonString = 'Bat';
  } else if (taxonType === TaxonTypeEnum.insect) {
    taxonString = 'Insect';
  }

  return value.replace('Bird', taxonString);
};

@Pipe({
  name: 'translateWithTaxonType'
})
export class TranslateWithTaxonTypePipe implements PipeTransform {
  constructor(
    private translate: TranslateService
  ) {}

  transform(value: string, taxonType?: TaxonTypeEnum): string {
    value = getTranslateKeyWithTaxonType(value, taxonType);
    return this.translate.instant(value);
  }
}

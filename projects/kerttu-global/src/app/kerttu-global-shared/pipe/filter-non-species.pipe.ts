import { Pipe, PipeTransform } from '@angular/core';
import { IGlobalSpecies, TaxonTypeEnum } from '../models';

@Pipe({
  name: 'filterNonSpecies',
})
export class FilterNonSpeciesPipe implements PipeTransform {
  transform(value: IGlobalSpecies[]): IGlobalSpecies[] {
    return value.filter(val => val.taxonType !== TaxonTypeEnum.other);
  }
}

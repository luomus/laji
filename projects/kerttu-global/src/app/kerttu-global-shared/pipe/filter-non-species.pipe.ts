import { Pipe, PipeTransform } from '@angular/core';
import { Species, TaxonTypeEnum } from '../models';

@Pipe({
  name: 'filterNonSpecies',
  pure: true,
  standalone: false
})
export class FilterNonSpeciesPipe implements PipeTransform {
  transform(value: Species[]): Species[] {
    return value.filter(val => val.taxonType !== TaxonTypeEnum.other);
  }
}

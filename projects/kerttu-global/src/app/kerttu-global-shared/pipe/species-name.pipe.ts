import { Pipe, PipeTransform } from '@angular/core';
import { IGlobalSpecies } from '../models';

@Pipe({
  name: 'speciesName'
})
export class SpeciesNamePipe implements PipeTransform {

  transform(value: IGlobalSpecies|IGlobalSpecies[]): any {
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v));
    }
    return (value.commonName ? value.commonName + ' - ' : '') + value.scientificName;
  }

}

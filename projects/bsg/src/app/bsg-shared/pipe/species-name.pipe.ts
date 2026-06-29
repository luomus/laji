import { Pipe, PipeTransform } from '@angular/core';
import { Species } from '../models';

@Pipe({
    name: 'speciesName',
    standalone: false
})
export class SpeciesNamePipe implements PipeTransform {

  transform(value: Species): string;
  transform(value: Species[]): string[];
  transform(value: Species|Species[]): string|string[] {
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v));
    }
    return (value.commonName ? value.commonName + ' - ' : '') + value.scientificName;
  }

}

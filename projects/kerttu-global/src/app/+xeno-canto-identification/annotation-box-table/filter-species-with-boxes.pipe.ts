import { Pipe, PipeTransform } from '@angular/core';
import { IdentificationHistorySpecies } from '../../kerttu-global-shared/models';

@Pipe({
  name: 'filterSpeciesWithBoxes',
  pure: true,
  standalone: false
})
export class FilterSpeciesWithBoxesPipe implements PipeTransform {
  transform(value: IdentificationHistorySpecies[]): IdentificationHistorySpecies[] {
    return (value).filter(s => s.boxCount && s.boxCount > 0);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { IdentificationHistorySpecies } from '../../kerttu-global-shared/models';

@Pipe({
  name: 'speciesBoxCount',
  pure: true,
  standalone: false
})
export class SpeciesBoxCountPipe implements PipeTransform {
  transform(species: IdentificationHistorySpecies[]): number {
    return (species).reduce((sum, s) => sum + (s.boxCount || 0), 0);
  }
}

